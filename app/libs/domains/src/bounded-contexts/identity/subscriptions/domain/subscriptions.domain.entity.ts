import {
  AggregateRoot,
  DomainEvent,
  Identifier,
  RepositoryPort,
  UUID,
  UseCase,
  Command,
} from '../../../../core';

export type SubscriptionId = Identifier;

export type SubscriptionTargetType = 'user' | 'concept' | 'collection' | 'team';

export interface SubscriptionProps {
  readonly followerId: UUID;
  readonly targetId: UUID;
  readonly targetType: SubscriptionTargetType;
  readonly createdAt: Date;
  readonly notificationsEnabled: boolean;
}

export interface SubscriptionAggregate
  extends AggregateRoot<SubscriptionId, SubscriptionProps, SubscriptionEvent> {}

export type SubscriptionEvent =
  | SubscriptionCreatedEvent
  | SubscriptionCancelledEvent
  | SubscriptionMutedEvent;

export interface SubscriptionCreatedEvent
  extends DomainEvent<{ readonly followerId: UUID; readonly targetId: UUID }> {}

export interface SubscriptionCancelledEvent
  extends DomainEvent<{ readonly followerId: UUID; readonly targetId: UUID }> {}

export interface SubscriptionMutedEvent
  extends DomainEvent<{
    readonly followerId: UUID;
    readonly targetId: UUID;
    readonly muted: boolean;
  }> {}

export interface SubscriptionRepository
  extends RepositoryPort<SubscriptionAggregate, SubscriptionId> {
  listFollowers(
    targetId: UUID,
    targetType: SubscriptionTargetType,
  ): Promise<readonly SubscriptionAggregate[]>;
  listFollowing(userId: UUID): Promise<readonly SubscriptionAggregate[]>;
}

export const SUBSCRIPTION_REPOSITORY = Symbol('SUBSCRIPTION_REPOSITORY');

export interface CreateSubscriptionCommand {
  readonly followerId: UUID;
  readonly targetId: UUID;
  readonly targetType: SubscriptionTargetType;
}

export interface CancelSubscriptionCommand {
  readonly subscriptionId: SubscriptionId;
  readonly performedBy: UUID;
}

export interface ToggleSubscriptionMuteCommand {
  readonly subscriptionId: SubscriptionId;
  readonly muted: boolean;
  readonly performedBy: UUID;
}

export type SubscriptionUseCase<
  TCommand extends Command<unknown>,
  TResult,
> = UseCase<TCommand, TResult>;
