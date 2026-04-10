import {
  AggregateRoot,
  Command,
  DomainEvent,
  Identifier,
  RepositoryPort,
  UUID,
  UseCase,
  ValueObject,
  WeightedScore,
} from '../../../../core';
import { ArticleId } from '../../articles/domain/articles.domain.entity';
import { ConceptId } from '../../concepts/domain/concepts.domain.entity';

export type BlockId = Identifier;

export type BlockType = 'heading' | 'paragraph' | 'quote' | 'list' | 'image' | 'table';

export interface BlockSource extends ValueObject<{ readonly url: string; readonly title?: string }> {
  readonly checksum?: string;
  readonly verifiedAt?: Date;
  readonly verdict?: 'pending' | 'verified' | 'rejected';
  readonly verificationNotes?: string;
}

export interface BlockAlternative extends ValueObject<{ readonly content: string }> {
  readonly language: string;
  readonly authorId: UUID;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly isPrimary: boolean;
  readonly voteScore: WeightedScore;
  readonly conceptBindings: readonly ConceptId[];
}

export interface BlockDiscussionSnapshot {
  readonly totalComments: number;
  readonly lastActivityAt?: Date;
}

export interface BlockProps {
  readonly articleId: ArticleId;
  readonly type: BlockType;
  readonly order: number;
  readonly sources: readonly BlockSource[];
  readonly alternatives: readonly BlockAlternative[];
  readonly discussion: BlockDiscussionSnapshot;
  readonly moderationFlags: readonly string[];
}

export interface BlockAggregate extends AggregateRoot<BlockId, BlockProps, BlockEvent> {}

export type BlockEvent =
  | BlockCreatedEvent
  | BlockAlternativeAddedEvent
  | BlockPrimaryAlternativeChangedEvent
  | BlockSourceVerifiedEvent
  | BlockReorderedEvent;

export interface BlockCreatedEvent extends DomainEvent<{ readonly articleId: ArticleId }> {}

export interface BlockAlternativeAddedEvent
  extends DomainEvent<{ readonly alternativeId: UUID; readonly language: string }> {}

export interface BlockPrimaryAlternativeChangedEvent
  extends DomainEvent<{ readonly alternativeId: UUID }> {}

export interface BlockSourceVerifiedEvent
  extends DomainEvent<{ readonly sourceUrl: string; readonly verdict: string }> {}

export interface BlockReorderedEvent
  extends DomainEvent<{ readonly from: number; readonly to: number }> {}

export interface BlockRepository extends RepositoryPort<BlockAggregate, BlockId> {
  listByArticle(articleId: ArticleId): Promise<readonly BlockAggregate[]>;
  findPrimaryByConcept(conceptId: ConceptId): Promise<readonly BlockAggregate[]>;
}

export const BLOCK_REPOSITORY = Symbol('BLOCK_REPOSITORY');

export interface CreateBlockCommand {
  readonly articleId: ArticleId;
  readonly type: BlockType;
  readonly order: number;
  readonly initialContent: string;
  readonly language: string;
  readonly authorId: UUID;
  readonly source?: BlockSource;
}

export interface AddBlockAlternativeCommand {
  readonly blockId: BlockId;
  readonly content: string;
  readonly language: string;
  readonly authorId: UUID;
  readonly conceptBindings?: readonly ConceptId[];
}

export interface VoteForBlockAlternativeCommand {
  readonly blockId: BlockId;
  readonly alternativeId: UUID;
  readonly voterId: UUID;
  readonly weight: number;
}

export interface VerifyBlockSourceCommand {
  readonly blockId: BlockId;
  readonly sourceUrl: string;
  readonly verdict: 'verified' | 'rejected';
  readonly verifierId: UUID;
  readonly notes?: string;
}

export type BlockUseCase<
  TCommand extends Command,
  TResult,
> = UseCase<TCommand, TResult>;
