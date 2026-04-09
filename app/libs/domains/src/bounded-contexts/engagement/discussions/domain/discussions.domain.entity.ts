import {
  AggregateRoot,
  DomainEvent,
  Identifier,
  PaginatedResult,
  RepositoryPort,
  UUID,
  UseCase,
  ValueObject,
} from '../../../../core';

export type DiscussionId = Identifier;
export type CommentId = Identifier;

export interface CommentAuthor extends ValueObject<{ readonly userId: UUID }> {
  readonly nickname: string;
  readonly reputationSnapshot: number;
}

export interface CommentProps {
  readonly id: CommentId;
  readonly author: CommentAuthor;
  readonly body: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly parentId?: CommentId;
  readonly editedByModerator?: UUID;
  readonly isHidden: boolean;
}

export interface DiscussionProps {
  readonly blockId: string;
  readonly comments: readonly CommentProps[];
  readonly totalParticipants: number;
  readonly lastActivityAt?: Date;
}

export interface DiscussionAggregate
  extends AggregateRoot<DiscussionId, DiscussionProps, DiscussionEvent> {}

export type DiscussionEvent =
  | CommentAddedEvent
  | CommentEditedEvent
  | CommentHiddenEvent
  | CommentRestoredEvent;

export interface CommentAddedEvent
  extends DomainEvent<{
    readonly commentId: CommentId;
    readonly parentId?: CommentId;
  }> {}

export interface CommentEditedEvent
  extends DomainEvent<{
    readonly commentId: CommentId;
    readonly editorId: UUID;
  }> {}

export interface CommentHiddenEvent
  extends DomainEvent<{
    readonly commentId: CommentId;
    readonly reason: string;
  }> {}

export interface CommentRestoredEvent
  extends DomainEvent<{
    readonly commentId: CommentId;
    readonly moderatorId: UUID;
  }> {}

export interface DiscussionRepository
  extends RepositoryPort<DiscussionAggregate, DiscussionId> {
  findByBlockId(blockId: string): Promise<DiscussionAggregate | null>;
  createForBlockId(blockId: string): Promise<DiscussionAggregate>;
  listActive(pagination: {
    readonly limit: number;
  }): Promise<PaginatedResult<DiscussionAggregate>>;
}

export const DISCUSSION_REPOSITORY = Symbol('DISCUSSION_REPOSITORY');

export interface AddCommentCommand {
  readonly discussionId: DiscussionId;
  readonly authorId: UUID;
  readonly body: string;
  readonly parentId?: CommentId;
}

export interface EditCommentCommand {
  readonly discussionId: DiscussionId;
  readonly commentId: CommentId;
  readonly editorId: UUID;
  readonly body: string;
}

export interface ModerateCommentCommand {
  readonly discussionId: DiscussionId;
  readonly commentId: CommentId;
  readonly moderatorId: UUID;
  readonly action: 'hide' | 'restore';
  readonly reason?: string;
}

import { Command } from '../../../../core';
export type DiscussionUseCase<
  TCommand extends Command<unknown>,
  TResult,
> = UseCase<TCommand, TResult>;
