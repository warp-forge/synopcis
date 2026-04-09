import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  Request,
  Inject,
  ForbiddenException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AddCommentDto } from '../dto/add-comment.dto';
import { EditCommentDto } from '../dto/edit-comment.dto';
import {
  DiscussionsDomainService,
  DISCUSSION_REPOSITORY,
  DiscussionRepository,
} from '@synop/domains';

@ApiTags('Discussions')
@Controller('discussions')
export class DiscussionsController {
  constructor(
    private readonly discussionsService: DiscussionsDomainService,
    @Inject(DISCUSSION_REPOSITORY)
    private readonly repository: DiscussionRepository,
  ) {}

  @Get(':blockId')
  async getDiscussion(@Param('blockId') blockId: string) {
    const discussion = await this.repository.findByBlockId(blockId);
    if (!discussion) {
      return { blockId, comments: [], totalParticipants: 0 };
    }
    return {
      id: discussion.id.value,
      blockId: discussion.props.blockId,
      comments: discussion.props.comments,
      totalParticipants: discussion.props.totalParticipants,
      lastActivityAt: discussion.props.lastActivityAt,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('block/:blockId/comments')
  async addCommentToBlock(
    @Param('blockId') blockId: string,
    @Body() dto: AddCommentDto,
    @Request() req,
  ) {
    let discussion = await this.repository.findByBlockId(blockId);
    if (!discussion) {
      discussion = await this.repository.createForBlockId(blockId);
    }

    await this.discussionsService.addComment({
      discussionId: discussion.id,
      authorId: req.user.id,
      body: dto.body,
      parentId: dto.parentId ? { value: dto.parentId } : undefined,
    });

    return { success: true };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':discussionId/comments')
  async addComment(
    @Param('discussionId') discussionId: string,
    @Body() dto: AddCommentDto,
    @Request() req,
  ) {
    await this.discussionsService.addComment({
      discussionId: { value: discussionId },
      authorId: req.user.id,
      body: dto.body,
      parentId: dto.parentId ? { value: dto.parentId } : undefined,
    });

    return { success: true };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':discussionId/comments/:commentId')
  async editComment(
    @Param('discussionId') discussionId: string,
    @Param('commentId') commentId: string,
    @Body() dto: EditCommentDto,
    @Request() req,
  ) {
    await this.discussionsService.editComment({
      discussionId: { value: discussionId },
      commentId: { value: commentId },
      editorId: req.user.id,
      body: dto.body,
    });

    return { success: true };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':discussionId/comments/:commentId')
  async deleteComment(
    @Param('discussionId') discussionId: string,
    @Param('commentId') commentId: string,
    @Request() req,
  ) {
    const discussion = await this.repository.findById(discussionId);
    if (!discussion) {
      throw new ForbiddenException('Comment not found');
    }
    const comment = discussion.props.comments.find(
      (c) => c.id.value === commentId,
    );
    if (!comment) {
      throw new ForbiddenException('Comment not found');
    }

    if (comment.author.value.userId !== req.user.id) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.discussionsService.moderateComment({
      discussionId: { value: discussionId },
      commentId: { value: commentId },
      moderatorId: req.user.id, // Using their own ID to mark it hidden by user
      action: 'hide',
      reason: 'User deleted',
    });
    return { success: true };
  }
}
