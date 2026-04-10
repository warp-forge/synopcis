import { Test, TestingModule } from '@nestjs/testing';
import { WorkerAiController } from './worker-ai.controller';
import { WorkerAiService } from './worker-ai.service';

describe('WorkerAiController', () => {
  let controller: WorkerAiController;

  let service: WorkerAiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkerAiController],
      providers: [
        {
          provide: WorkerAiService,
          useValue: {
            status: jest.fn(() => Promise.resolve({
              status: 'ready',
              processed: 0,
            })),
            recentAnalyses: jest.fn(() => Promise.resolve([])),
            getAnalytics: jest.fn(),
            getTask: jest.fn(),
            cancelTask: jest.fn(),
            restartTask: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(WorkerAiController);
    service = module.get(WorkerAiService);
  });

  it('reports the worker status', async () => {
    expect(await controller.health()).toEqual({ status: 'ready', processed: 0 });
  });

  it('should return analytics', async () => {
    const mockAnalytics = { total: 0, pending: 0, processing: 0, completed: 0, failed: 0, cancelled: 0, processedAnalyses: 0 };
    jest.spyOn(service, 'getAnalytics').mockResolvedValue(mockAnalytics as any);

    expect(await controller.getAnalytics()).toEqual(mockAnalytics);
  });

  it('should get task by id', async () => {
    const mockTaskState: any = { status: 'pending' };
    jest.spyOn(service, 'getTask').mockResolvedValue(mockTaskState);

    expect(await controller.getTask('123')).toEqual(mockTaskState);
  });

  it('should throw NotFoundException if task not found', async () => {
    jest.spyOn(service, 'getTask').mockResolvedValue(null);

    await expect(controller.getTask('123')).rejects.toThrow('Task with id 123 not found');
  });

  it('should cancel a task', async () => {
    jest.spyOn(service, 'cancelTask').mockResolvedValue(true);

    expect(await controller.cancelTask('123')).toEqual({ status: 'cancelled', id: '123' });
  });

  it('should throw BadRequestException if task cannot be cancelled', async () => {
    jest.spyOn(service, 'cancelTask').mockResolvedValue(false);

    await expect(controller.cancelTask('123')).rejects.toThrow();
  });

  it('should restart a task', async () => {
    const mockResult = { status: 'processing' };
    jest.spyOn(service, 'restartTask').mockResolvedValue(mockResult);

    expect(await controller.restartTask('123')).toEqual(mockResult);
  });

  it('should throw BadRequestException if task cannot be restarted', async () => {
    jest.spyOn(service, 'restartTask').mockResolvedValue(undefined);

    await expect(controller.restartTask('123')).rejects.toThrow();
  });
});
