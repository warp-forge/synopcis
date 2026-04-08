import {
  AggregateRoot,
  DomainEvent,
  Identifier,
  RepositoryPort,
  UUID,
  UseCase,
  ValueObject,
  WeightedScore,
} from '../../../../core';

export type VoteId = Identifier;

export type VoteTargetType =
  | 'block-alternative'
  | 'article-link'
  | 'concept-relation'
  | 'comment';

export interface VoteTarget extends ValueObject<{ readonly id: UUID; readonly type: VoteTargetType }> {}

export interface VoteProps {
  readonly voterId: UUID;
  readonly target: VoteTarget;
  readonly score: number;
  readonly weight: number;
  readonly reason?: string;
}

export interface VoteAggregate extends AggregateRoot<VoteId, VoteProps, VoteEvent> {}

export type VoteEvent = VoteCastEvent | VoteRetractedEvent;

export interface VoteCastEvent extends DomainEvent<{ readonly target: VoteTarget; readonly score: number }> {}

export interface VoteRetractedEvent extends DomainEvent<{ readonly target: VoteTarget }> {}

export interface VoteRepository extends RepositoryPort<VoteAggregate, VoteId> {
  findByTarget(target: VoteTarget, voterId: UUID): Promise<VoteAggregate | null>;
  aggregateScore(target: VoteTarget): Promise<WeightedScore>;
}

export const VOTE_REPOSITORY = Symbol('VOTE_REPOSITORY');

export interface CastVoteCommand {
  readonly voterId: UUID;
  readonly target: VoteTarget;
  readonly score: number;
  readonly reason?: string;
}

export interface RetractVoteCommand {
  readonly voteId: VoteId;
  readonly performedBy: UUID;
}

import { Command } from '../../../../core';
export type VoteUseCase<TCommand extends Command<unknown>, TResult> = UseCase<TCommand, TResult>;
