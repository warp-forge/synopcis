import {
  AggregateRoot,
  Command,
  DomainEvent,
  DomainPolicy,
  Identifier,
  LocalizedText,
  PaginatedResult,
  RepositoryPort,
  SearchPort,
  UUID,
  UseCase,
  ValueObject,
  VectorEmbedding,
} from '../../../../core';

export type ConceptId = Identifier;

export type ConceptKind = 'category' | 'property' | 'value' | 'entity' | 'tag';

export interface ConceptSynonym extends ValueObject<{ readonly key: string }>, LocalizedText {
  readonly relevance: number;
}

export interface ConceptLabel extends ValueObject<LocalizedText> {
  readonly preferred: boolean;
  readonly context?: string;
}

export interface ConceptRelation
  extends ValueObject<{
    readonly type: ConceptRelationType;
    readonly language: string;
    readonly text: string;
  }> {
  readonly targetId: ConceptId;
  readonly confidence: number;
}

export type ConceptRelationType =
  | 'parent'
  | 'child'
  | 'similar'
  | 'contradicts'
  | 'influences'
  | 'derived-from';

export interface ConceptProps {
  readonly key: string;
  readonly kind: ConceptKind;
  readonly parentId?: ConceptId;
  readonly vector?: VectorEmbedding;
  readonly isFrozen: boolean;
  readonly synonyms: readonly ConceptSynonym[];
  readonly labels: readonly ConceptLabel[];
  readonly relations: readonly ConceptRelation[];
  readonly metadata?: Record<string, unknown>;
}

export interface ConceptAggregate extends AggregateRoot<ConceptId, ConceptProps, ConceptEvent> {
  readonly props: ConceptProps;
}

export type ConceptEvent =
  | ConceptCreatedEvent
  | ConceptUpdatedEvent
  | ConceptMergedEvent
  | ConceptVectorUpdatedEvent;

export interface ConceptCreatedEvent extends DomainEvent<{ readonly key: string }> {
  readonly payload: {
    readonly key: string;
    readonly kind: ConceptKind;
    readonly parentId?: ConceptId;
  };
}

export interface ConceptUpdatedEvent
  extends DomainEvent<{ readonly changes: Partial<ConceptProps> }> {}

export interface ConceptMergedEvent
  extends DomainEvent<{ readonly sourceId: ConceptId; readonly targetId: ConceptId }> {}

export interface ConceptVectorUpdatedEvent
  extends DomainEvent<{ readonly vector: VectorEmbedding }> {}

export interface ConceptRepository
  extends RepositoryPort<ConceptAggregate, ConceptId>,
    SearchPort<ConceptAggregate> {
  findByKey(key: string): Promise<ConceptAggregate | null>;
  listChildren(parentId: ConceptId): Promise<PaginatedResult<ConceptAggregate>>;
  listRoots(): Promise<PaginatedResult<ConceptAggregate>>;
}

export const CONCEPT_REPOSITORY = Symbol('CONCEPT_REPOSITORY');

export interface ConceptPolicies {
  readonly freezePolicy: DomainPolicy<{
    readonly concept: ConceptAggregate;
    readonly actorId: UUID;
  }>;
  readonly mergePolicy: DomainPolicy<{
    readonly source: ConceptAggregate;
    readonly target: ConceptAggregate;
    readonly actorId: UUID;
  }>;
}

export const CONCEPT_POLICIES = Symbol('CONCEPT_POLICIES');

export interface CreateConceptCommand {
  readonly key: string;
  readonly kind: ConceptKind;
  readonly parentId?: ConceptId;
  readonly labels: readonly ConceptLabel[];
}

export interface UpdateConceptCommand {
  readonly conceptId: ConceptId;
  readonly labels?: readonly ConceptLabel[];
  readonly synonyms?: readonly ConceptSynonym[];
  readonly relations?: readonly ConceptRelation[];
  readonly metadata?: Record<string, unknown>;
}

export interface MergeConceptsCommand {
  readonly sourceId: ConceptId;
  readonly targetId: ConceptId;
  readonly performedBy: UUID;
}

export interface UpdateConceptVectorCommand {
  readonly conceptId: ConceptId;
  readonly vector: VectorEmbedding;
  readonly performedBy: UUID;
}

export type ConceptUseCase<
  TCommand extends Command,
  TResult,
> = UseCase<TCommand, TResult>;
