import { Inject, Injectable } from '@nestjs/common';
import {
  DISCUSSION_REPOSITORY,
  DiscussionAggregate,
  AddCommentCommand,
  EditCommentCommand,
  ModerateCommentCommand,
} from './discussions.domain.entity';
import type { DiscussionRepository } from './discussions.domain.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DiscussionsDomainService {
  constructor(
    @Inject(DISCUSSION_REPOSITORY)
    private readonly repository: DiscussionRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async addComment(command: AddCommentCommand): Promise<DiscussionAggregate> {
    const discussion = await this.repository.findById(
      command.discussionId.value,
    );
    if (!discussion) {
      throw new Error('Discussion not found');
    }

    const commentId = { value: uuidv4() };

    const newComment = {
      id: commentId,
      author: {
        value: { userId: command.authorId },
        nickname: 'User', // In a real app, fetch from user service
        reputationSnapshot: 0,
      },
      body: command.body,
      createdAt: new Date(),
      updatedAt: new Date(),
      parentId: command.parentId,
      isHidden: false,
    };

    const updatedDiscussion = {
      ...discussion,
      props: {
        ...discussion.props,
        comments: [...discussion.props.comments, newComment],
        totalParticipants: discussion.props.totalParticipants + 1, // Simplified
        lastActivityAt: new Date(),
      },
    };

    await this.repository.save(updatedDiscussion);

    this.eventEmitter.emit('comment.added', {
      discussionId: command.discussionId.value,
      authorId: command.authorId,
      parentId: command.parentId?.value,
      body: command.body,
    });

    return updatedDiscussion;
  }

  async editComment(command: EditCommentCommand): Promise<DiscussionAggregate> {
    const discussion = await this.repository.findById(
      command.discussionId.value,
    );
    if (!discussion) {
      throw new Error('Discussion not found');
    }

    let found = false;
    const updatedComments = discussion.props.comments.map((c) => {
      if (
        c.id.value === command.commentId.value &&
        c.author.value.userId === command.editorId
      ) {
        found = true;
        return { ...c, body: command.body, updatedAt: new Date() };
      }
      return c;
    });

    if (!found) {
      throw new Error('Comment not found or unauthorized');
    }

    const updatedDiscussion = {
      ...discussion,
      props: {
        ...discussion.props,
        comments: updatedComments,
      },
    };

    await this.repository.save(updatedDiscussion);
    return updatedDiscussion;
  }

  async moderateComment(
    command: ModerateCommentCommand,
  ): Promise<DiscussionAggregate> {
    const discussion = await this.repository.findById(
      command.discussionId.value,
    );
    if (!discussion) {
      throw new Error('Discussion not found');
    }

    let found = false;
    const updatedComments = discussion.props.comments.map((c) => {
      if (c.id.value === command.commentId.value) {
        found = true;
        return {
          ...c,
          isHidden: command.action === 'hide',
          editedByModerator: command.moderatorId,
          updatedAt: new Date(),
        };
      }
      return c;
    });

    if (!found) {
      throw new Error('Comment not found');
    }

    const updatedDiscussion = {
      ...discussion,
      props: {
        ...discussion.props,
        comments: updatedComments,
      },
    };

    await this.repository.save(updatedDiscussion);
    return updatedDiscussion;
  }
}
