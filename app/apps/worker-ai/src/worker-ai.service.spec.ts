import { Test, TestingModule } from '@nestjs/testing';
import { WorkerAiService } from './worker-ai.service';
import { MarkdownRenderer } from '@synop/shared-kernel';

describe('WorkerAiService', () => {
  let service: WorkerAiService;
  let renderer: MarkdownRenderer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkerAiService,
        {
          provide: MarkdownRenderer,
          useValue: {
            render: jest.fn((text) => text),
          },
        },
      ],
    }).compile();

    service = module.get<WorkerAiService>(WorkerAiService);
    renderer = module.get<MarkdownRenderer>(MarkdownRenderer);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('analyzeSource', () => {
    it('should process task successfully', async () => {
      const task: any = {
        id: '1',
        type: 'analyze.source',
        payload: { articleSlug: 'test', sourceUrl: 'http://test' },
      };

      const result = await service.analyzeSource(task);

      expect(result).toEqual({
        taskId: '1',
        type: 'analyze.source',
        status: 'completed',
        detail: 'analysis prepared for test',
      });

      const state = service.getTask('1');
      expect(state).toBeDefined();
      expect(state?.status).toBe('completed');
      expect(state?.attempts).toBe(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const task: any = {
        id: '2',
        type: 'analyze.source',
        payload: { articleSlug: 'test', sourceUrl: 'http://test' },
      };

      // Mock renderer to throw twice, then succeed
      let count = 0;
      (renderer.render as jest.Mock).mockImplementation(() => {
        count++;
        if (count < 3) {
          throw new Error('Temporary error');
        }
        return 'success';
      });

      const result = await service.analyzeSource(task);

      expect(result.status).toBe('completed');
      const state = service.getTask('2');
      expect(state?.attempts).toBe(3);
    });

    it('should fail after max retries and trigger critical failure', async () => {
      const task: any = {
        id: '3',
        type: 'analyze.source',
        payload: { articleSlug: 'test', sourceUrl: 'http://test' },
      };

      // Spy on logger
      const loggerSpy = jest.spyOn((service as any).logger, 'error');

      (renderer.render as jest.Mock).mockImplementation(() => {
        throw new Error('Permanent error');
      });

      const result = await service.analyzeSource(task);

      expect(result.status).toBe('failed');
      const state = service.getTask('3');
      expect(state?.attempts).toBe(3);
      expect(state?.status).toBe('failed');

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('CRITICAL FAILURE'),
        expect.any(String),
      );
    });
  });

  describe('cancelTask', () => {
    it('should cancel a pending task', () => {
       // We can directly manipulate internal task map or create one by restarting a non-existent task
       // but simpler is to mock runWithRetry blocking, instead let's just initialize a task via internal methods.
       (service as any).tasks.set('4', {
         status: 'pending',
         attempts: 0,
         task: { id: '4' },
         updatedAt: new Date()
       });

       const result = service.cancelTask('4');
       expect(result).toBe(true);
       expect(service.getTask('4')?.status).toBe('cancelled');
    });

    it('should not cancel a completed task', async () => {
      const task: any = {
        id: '5',
        type: 'analyze.source',
        payload: { articleSlug: 'test', sourceUrl: 'http://test' },
      };
      await service.analyzeSource(task);

      const result = service.cancelTask('5');
      expect(result).toBe(false);
      expect(service.getTask('5')?.status).toBe('completed');
    });
  });

  describe('restartTask', () => {
    it('should restart a failed task', async () => {
       (service as any).tasks.set('6', {
         status: 'failed',
         attempts: 3,
         task: { id: '6', type: 'analyze.source', payload: { articleSlug: 'test', sourceUrl: 'http://test'} },
         updatedAt: new Date()
       });

       const result = await service.restartTask('6');
       expect(result).toBeDefined();
       expect(result.status).toBe('completed');
       const state = service.getTask('6');
       expect(state?.status).toBe('completed');
       expect(state?.attempts).toBe(1);
    });

    it('should not restart a completed task', async () => {
       (service as any).tasks.set('7', {
         status: 'completed',
         attempts: 1,
         task: { id: '7' },
         updatedAt: new Date()
       });

       const result = await service.restartTask('7');
       expect(result).toBeUndefined();
    });
  });
});
