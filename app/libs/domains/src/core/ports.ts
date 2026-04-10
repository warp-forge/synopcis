import {
  AggregateRoot,
  Command,
  CursorPagination,
  DomainEvent,
  Identifier,
  PaginatedResult,
  Query,
  TimeRangeFilter,
  UUID,
} from './types';

export interface RepositoryPort<
  TAggregate extends AggregateRoot,
  TId extends Identifier = Identifier,
> {
  findById(id: TId): Promise<TAggregate | null>;
  save(aggregate: TAggregate): Promise<void>;
  delete(id: TId): Promise<void>;
}

export interface SearchPort<TAggregate extends AggregateRoot> {
  search(
    query: Query,
    pagination?: CursorPagination,
  ): Promise<PaginatedResult<TAggregate>>;
}

export interface EventPublisherPort<TEvent extends DomainEvent = DomainEvent> {
  publish(event: TEvent): Promise<void>;
  publishAll(events: readonly TEvent[]): Promise<void>;
}

export interface UnitOfWorkPort {
  transactional<T>(work: () => Promise<T>): Promise<T>;
}

export interface AuditLogPort {
  log(action: string, actorId: UUID, targetId: UUID, metadata?: unknown): Promise<void>;
}

export interface UseCase<
  TCommand extends Command,
  TResult,
> {
  execute(command: TCommand): Promise<TResult>;
}

export interface ProjectionPort<TProjection> {
  project(aggregate: AggregateRoot): Promise<void>;
  load(criteria: Query): Promise<PaginatedResult<TProjection>>;
}

export interface MetricsPort {
  incrementCounter(metric: string, labels?: Record<string, string>): Promise<void>;
  recordTiming(metric: string, milliseconds: number, labels?: Record<string, string>): Promise<void>;
}

export interface TimeSeriesPort<TPoint> {
  collect(range: TimeRangeFilter): Promise<readonly TPoint[]>;
}
