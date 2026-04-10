import {
  AggregateRoot,
  DomainEvent,
  Identifier,
  RepositoryPort,
  UUID,
  UseCase,
  WeightedScore,
} from '../../../../core';

export type DuelId = Identifier;

export interface DuelCandidate {
  readonly blockId: any;
  readonly alternativeId: UUID;
  readonly language: string;
}

export type DuelStatus = 'pending' | 'active' | 'completed' | 'cancelled';

export interface DuelProps {
  readonly left: DuelCandidate;
  readonly right: DuelCandidate;
  readonly status: DuelStatus;
  readonly startedAt?: Date;
  readonly completedAt?: Date;
  readonly votesLeft: WeightedScore;
  readonly votesRight: WeightedScore;
  readonly createdBy: UUID;
}

export interface DuelAggregate extends AggregateRoot<DuelId, DuelProps, DuelEvent> {}

export type DuelEvent =
  | DuelStartedEvent
  | DuelVoteRegisteredEvent
  | DuelCompletedEvent
  | DuelCancelledEvent;

export interface DuelStartedEvent extends DomainEvent<{ readonly left: DuelCandidate; readonly right: DuelCandidate }> {}

export interface DuelVoteRegisteredEvent
  extends DomainEvent<{ readonly duelId: DuelId; readonly side: 'left' | 'right'; readonly voterId: UUID }> {}

export interface DuelCompletedEvent extends DomainEvent<{ readonly winner: 'left' | 'right' | 'draw' }> {}

export interface DuelCancelledEvent extends DomainEvent<{ readonly reason: string }> {}

export interface DuelRepository extends RepositoryPort<DuelAggregate, DuelId> {
  listActive(): Promise<readonly DuelAggregate[]>;
}

export const DUEL_REPOSITORY = Symbol('DUEL_REPOSITORY');

export interface StartDuelCommand {
  readonly left: DuelCandidate;
  readonly right: DuelCandidate;
  readonly initiatedBy: UUID;
}

export interface RegisterDuelVoteCommand {
  readonly duelId: DuelId;
  readonly voterId: UUID;
  readonly side: 'left' | 'right';
}

export interface CancelDuelCommand {
  readonly duelId: DuelId;
  readonly performedBy: UUID;
  readonly reason: string;
}

import { Command } from '../../../../core';
export type DuelUseCase<TCommand extends Command<unknown>, TResult> = UseCase<TCommand, TResult>;
