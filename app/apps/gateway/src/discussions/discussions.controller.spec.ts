import { Test, TestingModule } from '@nestjs/testing';
import { DiscussionsController } from './discussions.controller';
import {
  DiscussionsDomainService,
  DISCUSSION_REPOSITORY,
} from '@synop/domains';

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

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
