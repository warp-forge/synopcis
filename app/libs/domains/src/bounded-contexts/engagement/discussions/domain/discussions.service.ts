import { Inject, Injectable } from '@nestjs/common';
import {
  DISCUSSION_REPOSITORY,
  DiscussionAggregate,
  AddCommentCommand,
  EditCommentCommand,
  ModerateCommentCommand,
} from './discussions.domain.entity';
import type {
  DiscussionRepository,
} from './discussions.domain.entity';

@Injectable()
export class DiscussionsDomainService {
  constructor(
    @Inject(DISCUSSION_REPOSITORY)
    private readonly repository: DiscussionRepository,
  ) {}

  async addComment(command: AddCommentCommand): Promise<DiscussionAggregate> {
    // TODO: implement add comment logic
    throw new Error('DiscussionsDomainService.addComment not implemented');
  }

  async editComment(command: EditCommentCommand): Promise<DiscussionAggregate> {
    // TODO: implement edit comment logic
    throw new Error('DiscussionsDomainService.editComment not implemented');
  }

  async moderateComment(
    command: ModerateCommentCommand,
  ): Promise<DiscussionAggregate> {
    // TODO: implement comment moderation logic
    throw new Error('DiscussionsDomainService.moderateComment not implemented');
  }
}
