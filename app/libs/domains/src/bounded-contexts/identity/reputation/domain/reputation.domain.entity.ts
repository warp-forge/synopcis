import {
  AggregateRoot,
  DomainEvent,
  Identifier,
  MetricsPort,
  RepositoryPort,
  TimeRangeFilter,
  TimeSeriesPort,
  UUID,
  UseCase,
  WeightedScore,
} from '../../../../core';

export type ReputationLedgerId = Identifier;

export interface ReputationEntry {
  readonly id: Identifier;
  readonly userId: UUID;
  readonly delta: number;
  readonly reason: ReputationReason;
  readonly occurredAt: Date;
  readonly referenceId?: UUID;
}

export type ReputationReason =
  | 'vote.received'
  | 'contribution.accepted'
  | 'report.acknowledged'
  | 'moderation.penalty'
  | 'system.adjustment';

export interface ReputationLedgerProps {
  readonly userId: UUID;
  readonly total: number;
  readonly history: readonly ReputationEntry[];
}

export interface ReputationLedgerAggregate
  extends AggregateRoot<
    ReputationLedgerId,
    ReputationLedgerProps,
    ReputationEvent
  > {}

export interface ReputationLedgerRepository
  extends RepositoryPort<ReputationLedgerAggregate, ReputationLedgerId> {
  findByUserId(userId: UUID): Promise<ReputationLedgerAggregate | null>;
}

export const REPUTATION_LEDGER_REPOSITORY = Symbol(
  'REPUTATION_LEDGER_REPOSITORY',
);

export interface ReputationEvent
  extends DomainEvent<{ readonly userId: UUID; readonly delta: number }> {}

export interface AdjustReputationCommand {
  readonly userId: UUID;
  readonly delta: number;
  readonly reason: ReputationReason;
  readonly referenceId?: UUID;
}

export interface GetReputationTrendQuery {
  readonly userId: UUID;
  readonly range: TimeRangeFilter;
}

export interface ReputationTrendPoint {
  readonly occurredAt: Date;
  readonly total: number;
}

export interface ReputationAnalyticsPort
  extends TimeSeriesPort<ReputationTrendPoint> {
  collect(
    range: TimeRangeFilter & { readonly userId: UUID },
  ): Promise<readonly ReputationTrendPoint[]>;
}

export const REPUTATION_ANALYTICS_PORT = Symbol('REPUTATION_ANALYTICS_PORT');

export interface ReputationUseCases {
  readonly adjustReputation: UseCase<any, ReputationEvent>;
  readonly getTrend: UseCase<any, readonly ReputationTrendPoint[]>;
}

export interface ReputationMetrics {
  readonly metrics: MetricsPort;
  readonly weighting: (reason: ReputationReason) => WeightedScore;
}

export const REPUTATION_METRICS = Symbol('REPUTATION_METRICS');

//TODO Implement concrete ledger aggregate and use cases.
