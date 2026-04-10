import {
  AggregateRoot,
  Command,
  DomainEvent,
  Identifier,
  RepositoryPort,
  UUID,
  UseCase,
  ValueObject,
} from '../../../../core';

export type NotificationId = Identifier;

export type NotificationChannel = 'in-app' | 'email' | 'push';

export interface NotificationTemplate extends ValueObject<{ readonly code: string }> {
  readonly title: string;
  readonly body: string;
  readonly channel: NotificationChannel;
}

export interface NotificationProps {
  readonly recipientId: UUID;
  readonly templateCode: string;
  readonly payload: Record<string, unknown>;
  readonly channel: NotificationChannel;
  readonly isRead: boolean;
  readonly deliveredAt?: Date;
  readonly readAt?: Date;
}

export interface NotificationAggregate
  extends AggregateRoot<NotificationId, NotificationProps, NotificationEvent> {}

export type NotificationEvent =
  | NotificationScheduledEvent
  | NotificationDeliveredEvent
  | NotificationReadEvent;

export interface NotificationScheduledEvent
  extends DomainEvent<{ readonly recipientId: UUID; readonly templateCode: string }> {}

export interface NotificationDeliveredEvent extends DomainEvent<{ readonly channel: NotificationChannel }> {}

export interface NotificationReadEvent extends DomainEvent<{ readonly readAt: Date }> {}

export interface NotificationRepository
  extends RepositoryPort<NotificationAggregate, NotificationId> {
  listUnread(recipientId: UUID): Promise<readonly NotificationAggregate[]>;
}

export const NOTIFICATION_REPOSITORY = Symbol('NOTIFICATION_REPOSITORY');

export interface ScheduleNotificationCommand {
  readonly recipientId: UUID;
  readonly templateCode: string;
  readonly payload: Record<string, unknown>;
  readonly channel: NotificationChannel;
}

export interface MarkNotificationReadCommand {
  readonly notificationId: NotificationId;
  readonly recipientId: UUID;
}

export type NotificationUseCase<
  TCommand extends Command,
  TResult,
> = UseCase<TCommand, TResult>;
