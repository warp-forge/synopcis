/**
 * Shared primitives used by all bounded contexts. They provide a thin, framework-agnostic
 * layer that enables us to express ubiquitous language in TypeScript while keeping
 * the domain model aligned with DDD and hexagonal architecture patterns.
 */

export type UUID = string;

export interface Identifier<TValue = UUID> {
  readonly value: TValue;
}

export interface Timestamped {
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface DomainEntity<TId extends Identifier = Identifier, TProps = unknown>
  extends Timestamped {
  readonly id: TId;
  readonly props: TProps;
}

export interface AggregateRoot<
  TId extends Identifier = Identifier,
  TProps = unknown,
  TEvent extends DomainEvent = DomainEvent,
> extends DomainEntity<TId, TProps> {
  readonly version: number;
  readonly changes: readonly TEvent[];
}

export type ValueObject<TProps> = Readonly<TProps>;

export interface DomainEvent<TPayload = unknown> {
  readonly name: string;
  readonly occurredOn: Date;
  readonly aggregateId: UUID;
  readonly payload: TPayload;
}

export interface DomainPolicy<TContext = unknown> {
  evaluate(context: TContext): Promise<void> | void;
}

export interface Command<TPayload = unknown> {
  readonly payload: TPayload;
}

export interface Query<TPayload = unknown> {
  readonly payload: TPayload;
}

export interface PaginatedResult<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly nextCursor?: string;
}

export type LanguageCode = 'en' | 'ru' | 'uk' | 'de' | 'fr' | string;

export interface VectorEmbedding {
  readonly dimensions: number;
  readonly values: readonly number[];
}

export interface Period {
  readonly start: Date;
  readonly end: Date;
}

export interface Money {
  readonly amount: number;
  readonly currency: string;
}

export interface WeightedScore {
  readonly score: number;
  readonly weight: number;
}

export interface CursorPagination {
  readonly cursor?: string;
  readonly limit?: number;
}

export interface TimeRangeFilter {
  readonly from?: Date;
  readonly to?: Date;
}

export interface Ownership {
  readonly userId: UUID;
  readonly teamId?: UUID;
}

export interface ModerationFlag {
  readonly reason: string;
  readonly expiresAt?: Date;
  readonly createdBy: UUID;
}

export interface LocalizedText {
  readonly language: LanguageCode;
  readonly text: string;
}
