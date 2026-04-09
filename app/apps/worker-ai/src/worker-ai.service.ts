import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { MarkdownRenderer, TaskMessage } from '@synop/shared-kernel';
import * as fs from 'fs';
import * as path from 'path';

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
export class WorkerAiService implements OnModuleInit, OnModuleDestroy {
  private readonly processed: AnalysisRecord[] = [];
  private readonly tasks = new Map<string, TaskState>();
  private readonly logger = new Logger(WorkerAiService.name);
  private readonly MAX_RETRIES = 3;
  private readonly dataDir = path.join(__dirname, '..', 'data');
  private readonly stateFile = path.join(this.dataDir, 'tasks.json');

  constructor(private readonly renderer: MarkdownRenderer) {}

  onModuleInit() {
    this.loadState();
  }

  onModuleDestroy() {
    this.saveState();
  }

  private loadState() {
    try {
      if (fs.existsSync(this.stateFile)) {
        const data = fs.readFileSync(this.stateFile, 'utf8');
        const parsed = JSON.parse(data);
        for (const [key, val] of Object.entries(parsed)) {
          const state = val as TaskState;
          state.updatedAt = new Date(state.updatedAt);
          // If a task was processing when it shut down, mark it failed to allow restart
          if (state.status === 'processing') {
            state.status = 'failed';
            state.error = 'Worker restarted during processing';
          }
          this.tasks.set(key, state);
        }
        this.logger.log(`Loaded ${this.tasks.size} tasks from state file.`);
      }
    } catch (err) {
      this.logger.error('Failed to load state', err);
    }
  }

  private saveState() {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
      const obj = Object.fromEntries(this.tasks);
      fs.writeFileSync(this.stateFile, JSON.stringify(obj, null, 2));
    } catch (err) {
      this.logger.error('Failed to save state', err);
    }
  }

  private persist() {
    this.saveState();
  }

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

      this.processed.push({
        id: task.id,
        articleSlug: payload.articleSlug,
        renderedSummary,
        completedAt: new Date(),
      });

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

      return {
        taskId: task.id,
        type: task.type,
        status: 'completed',
        detail: `suggestions prepared for ${payload.phenomenonSlug}`,
        payload: suggestions,
      };
    });
  }

  private async runWithRetry<T>(task: TaskMessage<T>, handler: (state: TaskState) => Promise<any> | any) {
    let state = this.tasks.get(task.id);
    if (!state) {
      state = {
        status: 'pending',
        attempts: 0,
        task,
        updatedAt: new Date(),
      };
      this.tasks.set(task.id, state);
      this.persist();
    }

    if (state.status === 'cancelled') {
      return { taskId: task.id, type: task.type, status: 'cancelled' };
    }

    while (state.attempts < this.MAX_RETRIES) {
      if (state.status === 'cancelled') {
        return { taskId: task.id, type: task.type, status: 'cancelled' };
      }

      state.status = 'processing';
      state.attempts += 1;
      state.updatedAt = new Date();
      this.persist();

      try {
        const result = await handler(state);

        // If it got cancelled during handler wait, override
        if (state.status === 'cancelled') {
           return { taskId: task.id, type: task.type, status: 'cancelled' };
        }

        state.status = 'completed';
        state.error = undefined;
        state.updatedAt = new Date();
        this.persist();
        return result;
      } catch (error) {
        if (state.status === 'cancelled') {
           return { taskId: task.id, type: task.type, status: 'cancelled' };
        }

        const err = error instanceof Error ? error : new Error(String(error));
        this.logger.warn(`Task ${task.id} attempt ${state.attempts} failed: ${err.message}`);

        if (state.attempts >= this.MAX_RETRIES) {
          state.status = 'failed';
          state.error = err.message;
          state.updatedAt = new Date();
          this.persist();
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

  getTask(id: string): TaskState | undefined {
    return this.tasks.get(id);
  }

  cancelTask(id: string): boolean {
    const state = this.tasks.get(id);
    if (!state) {
      return false;
    }

    if (state.status === 'completed' || state.status === 'failed' || state.status === 'cancelled') {
      return false; // Can't cancel already finished tasks
    }

    state.status = 'cancelled';
    state.updatedAt = new Date();
    this.persist();
    return true;
  }

  async restartTask(id: string): Promise<any | undefined> {
    const state = this.tasks.get(id);
    if (!state) {
      return undefined;
    }

    if (state.status !== 'failed' && state.status !== 'cancelled') {
      return undefined; // Only failed or cancelled tasks can be restarted
    }

    state.status = 'pending';
    state.attempts = 0;
    state.error = undefined;
    state.updatedAt = new Date();
    this.persist();

    // Re-dispatch task based on type
    if (state.task.type === 'analyze.source') {
      return this.analyzeSource(state.task);
    } else if (state.task.type === 'get.ai.suggestions') {
      return this.getAiSuggestions(state.task);
    }

    return undefined;
  }

  getAnalytics() {
    const total = this.tasks.size;
    let pending = 0;
    let processing = 0;
    let completed = 0;
    let failed = 0;
    let cancelled = 0;

    for (const state of this.tasks.values()) {
      switch (state.status) {
        case 'pending': pending++; break;
        case 'processing': processing++; break;
        case 'completed': completed++; break;
        case 'failed': failed++; break;
        case 'cancelled': cancelled++; break;
      }
    }

    return {
      total,
      pending,
      processing,
      completed,
      failed,
      cancelled,
      processedAnalyses: this.processed.length,
    };
  }

  status() {
    return {
      status: 'ready',
      processed: this.processed.length,
    };
  }

  recentAnalyses(limit = 5): AnalysisRecord[] {
    return this.processed.slice(-limit).reverse();
  }
}
