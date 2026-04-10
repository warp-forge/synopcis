import { Test, TestingModule } from '@nestjs/testing';
import { DiscussionsController } from './discussions.controller';
import {
  DiscussionsDomainService,
  DISCUSSION_REPOSITORY,
} from '@synop/domains';
import { ForbiddenException } from '@nestjs/common';

describe('DiscussionsController', () => {
  let controller: DiscussionsController;

  const mockDiscussionsService = {
    addComment: jest.fn(),
    editComment: jest.fn(),
    moderateComment: jest.fn(),
  };

  const mockRepository = {
    findByBlockId: jest.fn(),
    createForBlockId: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscussionsController],
      providers: [
        {
          provide: DiscussionsDomainService,
          useValue: mockDiscussionsService,
        },
        {
          provide: DISCUSSION_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    controller = module.get<DiscussionsController>(DiscussionsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should add comment', async () => {
    mockDiscussionsService.addComment.mockResolvedValue({});
    const req = { user: { id: 'u1' } };
    const res = await controller.addComment('d1', { body: 'hello' }, req);
    expect(res).toEqual({ success: true });
    expect(mockDiscussionsService.addComment).toHaveBeenCalledWith({
      discussionId: { value: 'd1' },
      authorId: 'u1',
      body: 'hello',
      parentId: undefined,
    });
  });

  it('should edit comment', async () => {
    mockDiscussionsService.editComment.mockResolvedValue({});
    const req = { user: { id: 'u1' } };
    const res = await controller.editComment(
      'd1',
      'c1',
      { body: 'hello' },
      req,
    );
    expect(res).toEqual({ success: true });
    expect(mockDiscussionsService.editComment).toHaveBeenCalledWith({
      discussionId: { value: 'd1' },
      commentId: { value: 'c1' },
      editorId: 'u1',
      body: 'hello',
    });
  });

  it('should prevent deleting other users comment', async () => {
    mockRepository.findById.mockResolvedValue({
      props: {
        comments: [
          { id: { value: 'c1' }, author: { value: { userId: 'u2' } } },
        ],
      },
    });
    const req = { user: { id: 'u1' } };

    await expect(controller.deleteComment('d1', 'c1', req)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should delete (hide) comment if author matches', async () => {
    mockRepository.findById.mockResolvedValue({
      props: {
        comments: [
          { id: { value: 'c1' }, author: { value: { userId: 'u1' } } },
        ],
      },
    });
    mockDiscussionsService.moderateComment.mockResolvedValue({});
    const req = { user: { id: 'u1' } };

    const res = await controller.deleteComment('d1', 'c1', req);
    expect(res).toEqual({ success: true });
    expect(mockDiscussionsService.moderateComment).toHaveBeenCalledWith({
      discussionId: { value: 'd1' },
      commentId: { value: 'c1' },
      moderatorId: 'u1',
      action: 'hide',
      reason: 'User deleted',
    });
  });
});
