import {
  Command,
  DomainEvent,
  PaginatedResult,
  Query,
  RepositoryPort,
  UUID,
  UseCase,
  Identifier,
} from '../../../../core';
export type FeedEventId = Identifier;

export type FeedEventType =
  | 'article.published'
  | 'block.alternative.won'
  | 'discussion.started'
  | 'duel.completed'
  | 'user.achievement.unlocked';

export interface FeedEventPayload {
  readonly articleId?: any;
  readonly blockId?: any;
  readonly actorId?: UUID;
  readonly metadata?: Record<string, unknown>;
}

export interface FeedEvent extends DomainEvent<FeedEventPayload> {
  readonly type: FeedEventType;
}

export interface FeedTimelineEntry {
  readonly id: FeedEventId;
  readonly recipientId: UUID;
  readonly event: FeedEvent;
  readonly deliveredAt: Date;
  readonly isRead: boolean;
}

export interface FeedTimelineRepository
  extends RepositoryPort<any, FeedEventId> {
  loadTimeline(
    recipientId: UUID,
    query: Query,
  ): Promise<PaginatedResult<FeedTimelineEntry>>;
}

export const FEED_TIMELINE_REPOSITORY = Symbol('FEED_TIMELINE_REPOSITORY');

export interface BuildFeedCommand
  extends Command<{
    readonly recipientId: UUID;
    readonly since?: Date;
  }> {}

export interface MarkFeedEntryReadCommand
  extends Command<{
    readonly entryId: FeedEventId;
    readonly recipientId: UUID;
  }> {}

export interface FeedUseCases {
  readonly buildPersonalFeed: UseCase<
    BuildFeedCommand,
    PaginatedResult<FeedTimelineEntry>
  >;
  readonly markEntryRead: UseCase<MarkFeedEntryReadCommand, void>;
}

//TODO Integrate with subscription preferences and analytics weighting.
