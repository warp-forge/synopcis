import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Discussion } from '../domain/discussion.entity';
import { Comment } from '../domain/comment.entity';
import {
  DiscussionAggregate,
  DiscussionRepository,
  DiscussionId,
  CommentProps,
} from '../domain/discussions.domain.entity';
import { PaginatedResult } from '../../../../core';

@Injectable()
export class PgDiscussionRepository implements DiscussionRepository {
  constructor(
    @InjectRepository(Discussion)
    private readonly discussionRepo: Repository<Discussion>,
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
  ) {}

  async findById(id: string): Promise<DiscussionAggregate | null> {
    const discussion = await this.discussionRepo.findOne({
      where: { id },
      relations: ['comments'],
    });

    if (!discussion) return null;

    return this.mapToAggregate(discussion);
  }

  async findByBlockId(blockId: string): Promise<DiscussionAggregate | null> {
    const discussion = await this.discussionRepo.findOne({
      where: { blockId },
      relations: ['comments'],
    });

    if (!discussion) return null;

    return this.mapToAggregate(discussion);
  }

  async createForBlockId(blockId: string): Promise<DiscussionAggregate> {
    let discussion = this.discussionRepo.create({ blockId });
    discussion = await this.discussionRepo.save(discussion);
    discussion.comments = [];
    return this.mapToAggregate(discussion);
  }

  async save(aggregate: DiscussionAggregate): Promise<void> {
    let discussion = await this.discussionRepo.findOne({
      where: { id: aggregate.id.value },
    });
    if (!discussion) {
      discussion = this.discussionRepo.create({
        id: aggregate.id.value,
        blockId: aggregate.props.blockId,
      });
    }

    discussion.totalParticipants = aggregate.props.totalParticipants;
    discussion.lastActivityAt = aggregate.props.lastActivityAt;
    await this.discussionRepo.save(discussion);

    for (const commentProp of aggregate.props.comments) {
      let comment = await this.commentRepo.findOne({
        where: { id: commentProp.id.value },
      });
      if (!comment) {
        comment = this.commentRepo.create({
          id: commentProp.id.value,
          discussionId: aggregate.id.value,
          authorId: commentProp.author.value.userId,
          body: commentProp.body,
          parentId: commentProp.parentId?.value,
          createdAt: commentProp.createdAt,
          updatedAt: commentProp.updatedAt,
          isHidden: commentProp.isHidden,
          editedByModerator: commentProp.editedByModerator,
        });
        await this.commentRepo.save(comment);
      } else {
        comment.body = commentProp.body;
        comment.isHidden = commentProp.isHidden;
        comment.editedByModerator = commentProp.editedByModerator;
        comment.updatedAt = commentProp.updatedAt;
        await this.commentRepo.save(comment);
      }
    }
  }

  async delete(aggregate: DiscussionAggregate): Promise<void> {
    await this.discussionRepo.delete({ id: aggregate.id.value });
  }

  async listActive(pagination: {
    readonly limit: number;
  }): Promise<PaginatedResult<DiscussionAggregate>> {
    const [discussions, total] = await this.discussionRepo.findAndCount({
      take: pagination.limit,
      order: { lastActivityAt: 'DESC' },
      relations: ['comments'],
    });

    return {
      items: discussions.map((d) => this.mapToAggregate(d)),
      total,
    };
  }

  private mapToAggregate(discussion: Discussion): DiscussionAggregate {
    const commentsProps: CommentProps[] = discussion.comments.map((c) => ({
      id: { value: c.id },
      author: {
        value: { userId: c.authorId },
        nickname: 'User',
        reputationSnapshot: 0,
      },
      body: c.body,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      parentId: c.parentId ? { value: c.parentId } : undefined,
      editedByModerator: c.editedByModerator,
      isHidden: c.isHidden,
    }));

    return {
      id: { value: discussion.id },
      props: {
        blockId: discussion.blockId,
        totalParticipants: discussion.totalParticipants,
        lastActivityAt: discussion.lastActivityAt,
        comments: commentsProps,
      },
      createdAt: discussion.createdAt,
      updatedAt: discussion.updatedAt,
      version: 1,
      changes: [],
      clearChanges: () => {},
    };
  }
}
