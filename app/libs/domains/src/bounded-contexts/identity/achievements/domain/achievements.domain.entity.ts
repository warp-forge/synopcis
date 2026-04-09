import {
  AggregateRoot,
  DomainEvent,
  Identifier,
  RepositoryPort,
  UUID,
  UseCase,
  ValueObject,
} from '../../../../core';

export type AchievementId = Identifier;
export type UserAchievementId = Identifier;

export interface AchievementDefinitionProps {
  readonly code: string;
  readonly title: string;
  readonly description: string;
  readonly icon: string;
  readonly criteria: readonly AchievementCriterion[];
  readonly isSecret: boolean;
}

export interface AchievementCriterion extends ValueObject<{ readonly type: AchievementCriterionType }> {
  readonly threshold: number;
  readonly windowDays?: number;
}

export type AchievementCriterionType =
  | 'articles.created'
  | 'votes.cast'
  | 'votes.received'
  | 'reports.resolved'
  | 'duels.won';

export interface AchievementDefinitionAggregate
  extends AggregateRoot<AchievementId, AchievementDefinitionProps, AchievementDefinitionEvent> {}

export type AchievementDefinitionEvent = AchievementDefinitionCreatedEvent | AchievementDefinitionUpdatedEvent;

export interface AchievementDefinitionCreatedEvent extends DomainEvent<{ readonly code: string }> {}

export interface AchievementDefinitionUpdatedEvent extends DomainEvent<{ readonly code: string }> {}

export interface AchievementDefinitionRepository
  extends RepositoryPort<AchievementDefinitionAggregate, AchievementId> {
  findByCode(code: string): Promise<AchievementDefinitionAggregate | null>;
}

export const ACHIEVEMENT_DEFINITION_REPOSITORY = Symbol('ACHIEVEMENT_DEFINITION_REPOSITORY');

export interface UserAchievementProps {
  readonly userId: UUID;
  readonly achievementId: AchievementId;
  readonly unlockedAt: Date;
  readonly evidence?: Record<string, unknown>;
}

export interface UserAchievementAggregate
  extends AggregateRoot<UserAchievementId, UserAchievementProps, UserAchievementEvent> {}

export type UserAchievementEvent = UserAchievementUnlockedEvent;

export interface UserAchievementUnlockedEvent
  extends DomainEvent<{ readonly userId: UUID; readonly achievementId: AchievementId }> {}

export interface UserAchievementRepository
  extends RepositoryPort<UserAchievementAggregate, UserAchievementId> {
  listByUser(userId: UUID): Promise<readonly UserAchievementAggregate[]>;
}

export const USER_ACHIEVEMENT_REPOSITORY = Symbol('USER_ACHIEVEMENT_REPOSITORY');

export interface EvaluateAchievementsCommand {
  readonly userId: UUID;
  readonly metricSnapshots: Record<string, number>;
}

export interface CreateAchievementDefinitionCommand extends AchievementDefinitionProps {}

import { Command } from '../../../../core';
export type AchievementUseCase<TCommand extends Command<unknown>, TResult> = UseCase<TCommand, TResult>;
