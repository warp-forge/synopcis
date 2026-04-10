import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarkdownRenderer, TaskMessage } from '@synop/shared-kernel';
import { AiTaskEntity } from './worker-ai.entity';

export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface TaskState {
  status: TaskStatus;
  attempts: number;
  error?: string;
  task: TaskMessage<any>;
  updatedAt: Date;
}

type AnalysisPayload = {
  articleSlug: string;
  sourceUrl: string;
};

type AnalysisRecord = {
  id: string;
  articleSlug: string;
  renderedSummary: string;
  completedAt: Date;
};

type SuggestionsPayload = {
  phenomenonSlug: string;
  text: string;
};

@Injectable()
export class WorkerAiService {
  private readonly logger = new Logger(WorkerAiService.name);
  private readonly MAX_RETRIES = 3;

  constructor(
    private readonly renderer: MarkdownRenderer,
    @InjectRepository(AiTaskEntity)
    private readonly taskRepository: Repository<AiTaskEntity>,
  ) {}

  private notifyCriticalFailure(task: TaskMessage<any>, error: Error) {
    this.logger.error(
      `CRITICAL FAILURE: Task ${task.id} (${task.type}) failed after ${this.MAX_RETRIES} attempts. Error: ${error.message}`,
      error.stack,
    );
    // Mock notification logic here
  }

  async analyzeSource(task: TaskMessage<AnalysisPayload>) {
    return this.runWithRetry(task, async (state) => {
      const payload = task.payload;
      const renderedSummary = this.renderer.render(
        `# AI analysis for ${payload.articleSlug}\n\nSource: ${payload.sourceUrl}`,
      );

      // Check cancellation again before mutating side effects
      if (state.status === 'cancelled') {
        throw new Error('Task was cancelled');
      }

      // Store results in payload
      state.payload = state.payload || {};
      state.payload.result = {
        renderedSummary,
        completedAt: new Date(),
      };

      return {
        taskId: task.id,
        type: task.type,
        status: 'completed',
        detail: `analysis prepared for ${payload.articleSlug}`,
      };
    });
  }

  async getAiSuggestions(task: TaskMessage<SuggestionsPayload>) {
    return this.runWithRetry(task, async (state) => {
      const payload = task.payload;
      const phenomena = ['apple', 'banana', 'orange'];
      const suggestions = phenomena
        .filter((phenomenon) => payload.text.includes(phenomenon))
        .map((phenomenon) => ({
          text: phenomenon,
          phenomenonSlug: phenomenon,
        }));

      // Check cancellation
      if (state.status === 'cancelled') {
        throw new Error('Task was cancelled');
      }

      state.payload = state.payload || {};
      state.payload.result = suggestions;

      return {
        taskId: task.id,
        type: task.type,
        status: 'completed',
        detail: `suggestions prepared for ${payload.phenomenonSlug}`,
        payload: suggestions,
      };
    });
  }

  private async runWithRetry<T>(task: TaskMessage<T>, handler: (entity: AiTaskEntity) => Promise<any> | any) {
    let entity = await this.taskRepository.findOne({ where: { id: task.id } });
    if (!entity) {
      entity = this.taskRepository.create({
        id: task.id,
        type: task.type,
        status: 'pending',
        attempts: 0,
        payload: task.payload,
      });
      await this.taskRepository.save(entity);
    }

    if (entity.status === 'cancelled') {
      return { taskId: task.id, type: task.type, status: 'cancelled' };
    }

    while (entity.attempts < this.MAX_RETRIES) {
      // Reload to catch cancellations
      entity = await this.taskRepository.findOneOrFail({ where: { id: task.id } });
      if (entity.status === 'cancelled') {
        return { taskId: task.id, type: task.type, status: 'cancelled' };
      }

      entity.status = 'processing';
      entity.attempts += 1;
      await this.taskRepository.save(entity);

      try {
        const result = await handler(entity);

        // Final load
        entity = await this.taskRepository.findOneOrFail({ where: { id: task.id } });
        if (entity.status === 'cancelled') {
           return { taskId: task.id, type: task.type, status: 'cancelled' };
        }

        entity.status = 'completed';
        entity.error = null;
        await this.taskRepository.save(entity);
        return result;
      } catch (error) {
        entity = await this.taskRepository.findOneOrFail({ where: { id: task.id } });
        if (entity.status === 'cancelled') {
           return { taskId: task.id, type: task.type, status: 'cancelled' };
        }

        const err = error instanceof Error ? error : new Error(String(error));
        this.logger.warn(`Task ${task.id} attempt ${entity.attempts} failed: ${err.message}`);

        if (entity.attempts >= this.MAX_RETRIES) {
          entity.status = 'failed';
          entity.error = err.message;
          await this.taskRepository.save(entity);
          this.notifyCriticalFailure(task, err);
          return {
            taskId: task.id,
            type: task.type,
            status: 'failed',
            detail: err.message,
          };
        }
      }
    }
  }

  async getTask(id: string): Promise<AiTaskEntity | null> {
    return this.taskRepository.findOne({ where: { id } });
  }

  async cancelTask(id: string): Promise<boolean> {
    const entity = await this.taskRepository.findOne({ where: { id } });
    if (!entity) {
      return false;
    }

    if (entity.status === 'completed' || entity.status === 'failed' || entity.status === 'cancelled') {
      return false; // Can't cancel already finished tasks
    }

    entity.status = 'cancelled';
    await this.taskRepository.save(entity);
    return true;
  }

  async restartTask(id: string): Promise<any | undefined> {
    const entity = await this.taskRepository.findOne({ where: { id } });
    if (!entity) {
      return undefined;
    }

    if (entity.status !== 'failed' && entity.status !== 'cancelled') {
      return undefined; // Only failed or cancelled tasks can be restarted
    }

    entity.status = 'pending';
    entity.attempts = 0;
    entity.error = null;
    await this.taskRepository.save(entity);

    // Re-dispatch task based on type
    const task: TaskMessage<any> = {
      id: entity.id,
      type: entity.type as any,
      payload: entity.payload,
      createdAt: entity.createdAt,
      priority: 'normal'
    };

    if (entity.type === 'analyze.source') {
      return this.analyzeSource(task);
    } else if (entity.type === 'get.ai.suggestions') {
      return this.getAiSuggestions(task);
    }

    return undefined;
  }

  async getAnalytics() {
    const total = await this.taskRepository.count();
    const pending = await this.taskRepository.count({ where: { status: 'pending' } });
    const processing = await this.taskRepository.count({ where: { status: 'processing' } });
    const completed = await this.taskRepository.count({ where: { status: 'completed' } });
    const failed = await this.taskRepository.count({ where: { status: 'failed' } });
    const cancelled = await this.taskRepository.count({ where: { status: 'cancelled' } });
    const processedAnalyses = await this.taskRepository.count({ where: { type: 'analyze.source', status: 'completed' } });

    return {
      total,
      pending,
      processing,
      completed,
      failed,
      cancelled,
      processedAnalyses,
    };
  }

  async status() {
    const processed = await this.taskRepository.count({ where: { type: 'analyze.source', status: 'completed' } });
    return {
      status: 'ready',
      processed,
    };
  }

  async recentAnalyses(limit = 5) {
    const records = await this.taskRepository.find({
      where: { type: 'analyze.source', status: 'completed' },
      order: { completedAt: 'DESC' },
      take: limit,
    });

    return records.map(r => ({
      id: r.id,
      articleSlug: r.payload.articleSlug,
      renderedSummary: r.payload.result?.renderedSummary,
      completedAt: r.payload.result?.completedAt || r.updatedAt,
    }));
  }
}
