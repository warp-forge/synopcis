import { Test, TestingModule } from '@nestjs/testing';
import { WorkerAiController } from './worker-ai.controller';
import { WorkerAiService } from './worker-ai.service';

describe('WorkerAiController', () => {
  let controller: WorkerAiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkerAiController],
      providers: [
        {
          provide: WorkerAiService,
          useValue: {
            status: jest.fn(() => ({
              status: 'ready',
              processed: 0,
            })),
            recentAnalyses: jest.fn(() => []),
            getQueueStatus: jest.fn(() => ({
              waiting: 0,
              active: 0,
              completed: 0,
              failed: 0,
            })),
          },
        },
        {
          provide: 'BullQueue_ai-embedding',
          useValue: { add: jest.fn() },
        },
        {
          provide: 'BullQueue_ai-ner',
          useValue: { add: jest.fn() },
        },
        {
          provide: 'BullQueue_ai-verify-source',
          useValue: { add: jest.fn() },
        },
        {
          provide: 'BullQueue_ai-translation',
          useValue: { add: jest.fn() },
        },
        {
          provide: 'BullQueue_ai-analysis',
          useValue: { add: jest.fn() },
        },
        {
          provide: 'BullQueue_ai-suggestions',
          useValue: { add: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get(WorkerAiController);
  });

  it('reports the worker status', () => {
    expect(controller.health()).toEqual({ status: 'ready', processed: 0 });
  });
});
