import { Injectable } from '@nestjs/common';
import { MarkdownRenderer, TaskMessage } from '@synop/shared-kernel';
import { randomUUID } from 'crypto';

import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

type AnalysisPayload = {
  articleSlug: string;
  sourceUrl: string;
};

export type AiTaskRecord = {
  id: string;
  type: string;
  status: string;
  result?: any;
  error?: string;
  completedAt: Date;
};

type SuggestionsPayload = {
  phenomenonSlug: string;
  text: string;
};

@Injectable()
export class WorkerAiService {
  private readonly processed: AiTaskRecord[] = [];

  constructor(
    private readonly renderer: MarkdownRenderer,
    @InjectQueue('ai-tasks') private aiQueue: Queue,
  ) {}

  saveTaskResult(record: AiTaskRecord) {
    this.processed.push(record);
  }

  async getQueueStatus() {
    const [waiting, active, completed, failed] = await Promise.all([
      this.aiQueue.getWaitingCount(),
      this.aiQueue.getActiveCount(),
      this.aiQueue.getCompletedCount(),
      this.aiQueue.getFailedCount(),
    ]);

    return { waiting, active, completed, failed };
  }

  async retryJob(jobId: string) {
    const job = await this.aiQueue.getJob(jobId);
    if (!job) {
      throw new Error('Job not found');
    }
    if (await job.isFailed()) {
      await job.retry();
      return true;
    }
    return false;
  }

  status() {
    return {
      status: 'ready',
      processed: this.processed.length,
    };
  }

  recentAnalyses(limit = 5): AiTaskRecord[] {
    return this.processed.slice(-limit).reverse();
  }

  runAnalyzeSource(payload: AnalysisPayload) {
    return this.renderer.render(
      `# AI analysis for ${payload.articleSlug}\n\nSource: ${payload.sourceUrl}`,
    );
  }

  runGetSuggestions(payload: SuggestionsPayload) {
    const phenomena = ['apple', 'banana', 'orange'];
    return phenomena
      .filter((phenomenon) => payload.text.includes(phenomenon))
      .map((phenomenon) => ({
        text: phenomenon,
        phenomenonSlug: phenomenon,
      }));
  }
}
