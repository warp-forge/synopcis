import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PhenomenonDomainService } from './phenomenon.domain.service';
import { PhenomenonEntity } from './phenomenon.entity';
import { PhenomenonBlockEntity } from './phenomenon-block.entity';
import { PhenomenonAlternativeEntity } from './phenomenon-alternative.entity';
import { PhenomenonVoteEntity } from './phenomenon-vote.entity';
import { ReputationDomainService } from '../bounded-contexts/identity/reputation/domain/reputation.service';

describe('PhenomenonDomainService Voting', () => {
  let service: PhenomenonDomainService;

  let mockPhenomenonRepo: any;
  let mockBlockRepo: any;
  let mockAlternativeRepo: any;
  let mockVoteRepo: any;

  beforeEach(async () => {
    mockPhenomenonRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOneBy: jest.fn(),
    };

    mockBlockRepo = {
      findOne: jest.fn(),
    };

    mockAlternativeRepo = {
      create: jest.fn(),
      save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
      findOne: jest.fn(),
    };

    mockVoteRepo = {
      create: jest.fn(),
      save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PhenomenonDomainService,
        {
          provide: getRepositoryToken(PhenomenonEntity),
          useValue: mockPhenomenonRepo,
        },
        {
          provide: getRepositoryToken(PhenomenonBlockEntity),
          useValue: mockBlockRepo,
        },
        {
          provide: getRepositoryToken(PhenomenonAlternativeEntity),
          useValue: mockAlternativeRepo,
        },
        {
          provide: getRepositoryToken(PhenomenonVoteEntity),
          useValue: mockVoteRepo,
        },
        {
          provide: ReputationDomainService,
          useValue: {
            getUserReputationScore: jest.fn().mockResolvedValue(10),
          },
        },
      ],
    }).compile();

    service = module.get<PhenomenonDomainService>(PhenomenonDomainService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addAlternative', () => {
    it('should create an alternative and set it as active if it is the first one', async () => {
      const blockId = 'block-1';
      mockBlockRepo.findOne.mockResolvedValue({
        id: blockId,
        alternatives: [],
      });
      mockAlternativeRepo.create.mockReturnValue({
        id: 'alt-1',
        block: { id: blockId },
        title: 'Title',
        level: 1,
        content: 'Content',
        authorId: 'author-1',
        isActive: true,
      });

      const alt = await service.addAlternative({
        blockId,
        title: 'Title',
        level: 1,
        content: 'Content',
        authorId: 'author-1',
      });

      expect(alt.isActive).toBe(true);
      expect(mockAlternativeRepo.save).toHaveBeenCalledWith(alt);
    });

    it('should create an alternative and set it as inactive if it is not the first one', async () => {
      const blockId = 'block-1';
      mockBlockRepo.findOne.mockResolvedValue({
        id: blockId,
        alternatives: [{ id: 'alt-1' }],
      });
      mockAlternativeRepo.create.mockReturnValue({
        id: 'alt-2',
        block: { id: blockId },
        title: 'Title',
        level: 1,
        content: 'Content',
        authorId: 'author-2',
        isActive: false,
      });

      const alt = await service.addAlternative({
        blockId,
        title: 'Title',
        level: 1,
        content: 'Content',
        authorId: 'author-2',
      });

      expect(alt.isActive).toBe(false);
      expect(mockAlternativeRepo.save).toHaveBeenCalledWith(alt);
    });
  });

  describe('recalculateActiveAlternative', () => {
    it('should set the alternative with the highest weight as active', async () => {
      const alt1 = { id: 'alt-1', isActive: true, votes: [{ weight: 1 }] };
      const alt2 = { id: 'alt-2', isActive: false, votes: [{ weight: 5 }] };
      const blockId = 'block-1';

      mockBlockRepo.findOne.mockResolvedValue({
        id: blockId,
        alternatives: [alt1, alt2],
      });

      await service.recalculateActiveAlternative(blockId);

      expect(alt1.isActive).toBe(false);
      expect(alt2.isActive).toBe(true);
      expect(mockAlternativeRepo.save).toHaveBeenCalledTimes(2);
    });
  });

  describe('voteForAlternative', () => {
    it('should add a vote and recalculate active alternative', async () => {
      const alternativeId = 'alt-2';
      const blockId = 'block-1';

      const alternative = { id: alternativeId, block: { id: blockId } };
      mockAlternativeRepo.findOne.mockResolvedValue(alternative);
      mockVoteRepo.findOne.mockResolvedValue(null);
      mockVoteRepo.create.mockReturnValue({
        id: 'vote-1',
        alternative,
        userId: 'user-1',
        weight: 10,
      });

      // Mock recalculateActiveAlternative internals
      mockBlockRepo.findOne.mockResolvedValue({
        id: blockId,
        alternatives: [
          { id: 'alt-1', isActive: true, votes: [{ weight: 1 }] },
          { id: 'alt-2', isActive: false, votes: [{ weight: 5 }] },
        ],
      });

      const vote = await service.voteForAlternative({
        alternativeId,
        userId: 'user-1',
      });

      expect(vote.weight).toBe(10);
      expect(mockVoteRepo.save).toHaveBeenCalledWith(vote);
      expect(mockBlockRepo.findOne).toHaveBeenCalledWith({
        where: { id: blockId },
        relations: ['alternatives', 'alternatives.votes'],
      });
      // alt-1 should be saved as false, alt-2 as true
      expect(mockAlternativeRepo.save).toHaveBeenCalledTimes(2);
    });
  });
});
