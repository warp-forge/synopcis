import {
  AggregateRoot,
  DomainEvent,
  Identifier,
  Ownership,
  PaginatedResult,
  RepositoryPort,
  UUID,
  UseCase,
  ValueObject,
  Command,
} from '../../../../core';
import { ConceptId } from '../../concepts/domain/concepts.domain.entity';

export type ArticleId = Identifier;

export interface ArticleSlug extends ValueObject<{ readonly value: string }> {}

export type ArticleStatus = 'draft' | 'published' | 'archived' | 'frozen';

export interface ArticleMetadata extends ValueObject<Record<string, unknown>> {
  readonly title: string;
  readonly summary?: string;
  readonly language: string;
  readonly tags: readonly string[];
}

export interface ArticleProps {
  readonly slug: ArticleSlug;
  readonly status: ArticleStatus;
  readonly metadata: ArticleMetadata;
  readonly canonicalConceptId?: ConceptId;
  readonly featuredConceptIds: readonly ConceptId[];
  readonly gitRepositoryPath: string;
  readonly ownership: Ownership;
  readonly publishedAt?: Date;
  readonly frozenUntil?: Date;
  readonly moderationFlags: readonly string[];
}

export interface ArticleAggregate
  extends AggregateRoot<ArticleId, ArticleProps, ArticleEvent> {}

export type ArticleEvent =
  | ArticleCreatedEvent
  | ArticleMetadataUpdatedEvent
  | ArticleStatusChangedEvent
  | ArticleFrozenEvent
  | ArticleConceptLinkedEvent;

export interface ArticleCreatedEvent
  extends DomainEvent<{ readonly slug: string; readonly status: ArticleStatus }> {}

export interface ArticleMetadataUpdatedEvent
  extends DomainEvent<{ readonly metadata: ArticleMetadata }> {}

export interface ArticleStatusChangedEvent extends DomainEvent<{ readonly status: ArticleStatus }> {}

export interface ArticleFrozenEvent extends DomainEvent<{ readonly frozenUntil: Date }> {}

export interface ArticleConceptLinkedEvent
  extends DomainEvent<{ readonly conceptId: ConceptId; readonly relation: 'primary' | 'secondary' }> {}

export interface ArticleRepository extends RepositoryPort<ArticleAggregate, ArticleId> {
  findBySlug(slug: string): Promise<ArticleAggregate | null>;
  listByConcept(conceptId: ConceptId): Promise<PaginatedResult<ArticleAggregate>>;
  listRecentlyPublished(limit: number): Promise<PaginatedResult<ArticleAggregate>>;
}

export const ARTICLE_REPOSITORY = Symbol('ARTICLE_REPOSITORY');

export interface CreateArticleCommand {
  readonly slug: string;
  readonly title: string;
  readonly summary?: string;
  readonly language: string;
  readonly ownerId: UUID;
  readonly teamId?: UUID;
}

export interface UpdateArticleMetadataCommand {
  readonly articleId: ArticleId;
  readonly title?: string;
  readonly summary?: string;
  readonly tags?: readonly string[];
  readonly canonicalConceptId?: ConceptId;
}

export interface ChangeArticleStatusCommand {
  readonly articleId: ArticleId;
  readonly status: ArticleStatus;
  readonly performedBy: UUID;
}

export interface FreezeArticleCommand {
  readonly articleId: ArticleId;
  readonly frozenUntil: Date;
  readonly reason: string;
  readonly performedBy: UUID;
}

export interface LinkArticleConceptCommand {
  readonly articleId: ArticleId;
  readonly conceptId: ConceptId;
  readonly relation: 'primary' | 'secondary';
  readonly performedBy: UUID;
}

export type ArticleUseCase<TCommand extends Command<unknown>, TResult> = UseCase<TCommand, TResult>;
