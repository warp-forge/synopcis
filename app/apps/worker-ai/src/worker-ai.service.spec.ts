import { Test, TestingModule } from '@nestjs/testing';
import { WorkerAiService } from './worker-ai.service';
import { MarkdownRenderer } from '@synop/shared-kernel';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AiTaskEntity } from './worker-ai.entity';

describe('WorkerAiService', () => {
  let service: WorkerAiService;
  let renderer: MarkdownRenderer;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      findOne: jest.fn(),
      findOneOrFail: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkerAiService,
        {
          provide: MarkdownRenderer,
          useValue: {
            render: jest.fn((text) => text),
          },
        },
        {
          provide: getRepositoryToken(AiTaskEntity),
          useValue: mockRepository,
        }
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

      const entity = { id: '1', status: 'pending', attempts: 0, payload: task.payload };
      mockRepository.findOne.mockResolvedValueOnce(null);
      mockRepository.create.mockReturnValue(entity);
      mockRepository.findOneOrFail.mockResolvedValue(entity);

      const result = await service.analyzeSource(task);

      expect(result).toEqual({
        taskId: '1',
        type: 'analyze.source',
        status: 'completed',
        detail: 'analysis prepared for test',
      });
      expect(entity.status).toBe('completed');
    });

    it('should retry on failure and eventually succeed', async () => {
      const task: any = {
        id: '2',
        type: 'analyze.source',
        payload: { articleSlug: 'test', sourceUrl: 'http://test' },
      };

      const entity = { id: '2', status: 'pending', attempts: 0, payload: task.payload };
      mockRepository.findOne.mockResolvedValueOnce(null);
      mockRepository.create.mockReturnValue(entity);
      mockRepository.findOneOrFail.mockResolvedValue(entity);

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
      expect(entity.attempts).toBe(3);
    });

    it('should fail after max retries and trigger critical failure', async () => {
      const task: any = {
        id: '3',
        type: 'analyze.source',
        payload: { articleSlug: 'test', sourceUrl: 'http://test' },
      };

      const entity = { id: '3', status: 'pending', attempts: 0, payload: task.payload };
      mockRepository.findOne.mockResolvedValueOnce(null);
      mockRepository.create.mockReturnValue(entity);
      mockRepository.findOneOrFail.mockResolvedValue(entity);

      const loggerSpy = jest.spyOn((service as any).logger, 'error');

      (renderer.render as jest.Mock).mockImplementation(() => {
        throw new Error('Permanent error');
      });

      const result = await service.analyzeSource(task);

      expect(result.status).toBe('failed');
      expect(entity.attempts).toBe(3);
      expect(entity.status).toBe('failed');

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('CRITICAL FAILURE'),
        expect.any(String),
      );
    });
  });

  describe('cancelTask', () => {
    it('should cancel a pending task', async () => {
       const entity = { id: '4', status: 'pending' };
       mockRepository.findOne.mockResolvedValue(entity);

       const result = await service.cancelTask('4');
       expect(result).toBe(true);
       expect(entity.status).toBe('cancelled');
    });

    it('should not cancel a completed task', async () => {
       const entity = { id: '5', status: 'completed' };
       mockRepository.findOne.mockResolvedValue(entity);

       const result = await service.cancelTask('5');
       expect(result).toBe(false);
       expect(entity.status).toBe('completed');
    });
  });

  describe('restartTask', () => {
    it('should restart a failed task', async () => {
       const entity = { id: '6', type: 'analyze.source', status: 'failed', payload: {} };
       mockRepository.findOne.mockResolvedValue(entity);
       mockRepository.findOneOrFail.mockResolvedValue(entity);

       const result = await service.restartTask('6');
       expect(result).toBeDefined();
       expect(entity.status).toBe('completed');
    });

    it('should not restart a completed task', async () => {
       const entity = { id: '7', status: 'completed' };
       mockRepository.findOne.mockResolvedValue(entity);

       const result = await service.restartTask('7');
       expect(result).toBeUndefined();
    });
  });
});
