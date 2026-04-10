import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { PhenomenonEntity } from './phenomenon.entity';
import { PhenomenonBlockEntity } from './phenomenon-block.entity';
import { PhenomenonAlternativeEntity } from './phenomenon-alternative.entity';
import { PhenomenonVoteEntity } from './phenomenon-vote.entity';
import { ReputationDomainService } from '../bounded-contexts/identity/reputation/domain/reputation.service';

export interface CreatePhenomenonInput {
  title: string;
  userId: string;
}

export interface AddAlternativeInput {
  blockId: string;
  title: string;
  level: number;
  content: string;
  authorId: string;
}

export interface VoteInput {
  alternativeId: string;
  userId: string;
}

@Injectable()
export class PhenomenonDomainService {
  constructor(
    @InjectRepository(PhenomenonEntity)
    private readonly phenomenonRepository: Repository<PhenomenonEntity>,
    @InjectRepository(PhenomenonBlockEntity)
    private readonly blockRepository: Repository<PhenomenonBlockEntity>,
    @InjectRepository(PhenomenonAlternativeEntity)
    private readonly alternativeRepository: Repository<PhenomenonAlternativeEntity>,
    @InjectRepository(PhenomenonVoteEntity)
    private readonly voteRepository: Repository<PhenomenonVoteEntity>,
    private readonly reputationDomainService: ReputationDomainService,
  ) {}

  async createPhenomenon(
    input: CreatePhenomenonInput,
  ): Promise<PhenomenonEntity> {
    const phenomenon = this.phenomenonRepository.create({
      id: uuidv4(),
      slug: input.title.toLowerCase().replace(/\\s+/g, '-'),
      userId: input.userId,
    });
    return this.phenomenonRepository.save(phenomenon);
  }

  async findPhenomenonById(id: string): Promise<PhenomenonEntity | null> {
    return this.phenomenonRepository.findOneBy({ id });
  }

  async findPhenomenonBySlug(slug: string): Promise<PhenomenonEntity | null> {
    return this.phenomenonRepository.findOneBy({ slug });
  }

  async addAlternative(
    input: AddAlternativeInput,
  ): Promise<PhenomenonAlternativeEntity> {
    const block = await this.blockRepository.findOne({
      where: { id: input.blockId },
      relations: ['alternatives'],
    });
    if (!block) {
      throw new Error(`Block with id ${input.blockId} not found`);
    }

    const isFirst = block.alternatives.length === 0;

    const alternative = this.alternativeRepository.create({
      id: uuidv4(),
      block,
      title: input.title,
      level: input.level,
      content: input.content,
      authorId: input.authorId,
      isActive: isFirst,
    });

    return this.alternativeRepository.save(alternative);
  }

  async voteForAlternative(input: VoteInput): Promise<PhenomenonVoteEntity> {
    const alternative = await this.alternativeRepository.findOne({
      where: { id: input.alternativeId },
      relations: ['block'],
    });

    if (!alternative) {
      throw new Error(`Alternative with id ${input.alternativeId} not found`);
    }

    let userWeight = 1;
    try {
      userWeight = await this.reputationDomainService.getUserReputationScore(
        input.userId,
      );
    } catch {
      // fallback to weight 1 if reputation lookup fails
    }

    let vote = await this.voteRepository.findOne({
      where: { alternative: { id: input.alternativeId }, userId: input.userId },
    });

    if (vote) {
      vote.weight = userWeight;
    } else {
      vote = this.voteRepository.create({
        id: uuidv4(),
        alternative,
        userId: input.userId,
        weight: userWeight,
      });
    }

    await this.voteRepository.save(vote);
    await this.recalculateActiveAlternative(alternative.block.id);

    return vote;
  }

  async recalculateActiveAlternative(blockId: string): Promise<void> {
    const block = await this.blockRepository.findOne({
      where: { id: blockId },
      relations: ['alternatives', 'alternatives.votes'],
    });

    if (!block || block.alternatives.length === 0) {
      return;
    }

    let maxWeight = -Infinity;
    let newActiveAlternativeId: string | null = null;

    for (const alt of block.alternatives) {
      const totalWeight = alt.votes.reduce((sum, vote) => sum + vote.weight, 0);
      if (totalWeight > maxWeight) {
        maxWeight = totalWeight;
        newActiveAlternativeId = alt.id;
      }
    }

    for (const alt of block.alternatives) {
      const shouldBeActive = alt.id === newActiveAlternativeId;
      if (alt.isActive !== shouldBeActive) {
        alt.isActive = shouldBeActive;
        await this.alternativeRepository.save(alt);
      }
    }
  }
}
