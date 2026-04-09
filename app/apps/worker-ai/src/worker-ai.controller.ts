import { Controller, Get, Param, Post } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TaskType } from '@synop/shared-kernel';
import type { TaskMessage } from '@synop/shared-kernel';
import { WorkerAiService } from './worker-ai.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

type AnalysisPayload = {
  articleSlug: string;
  sourceUrl: string;
};

type SuggestionsPayload = {
  phenomenonSlug: string;
  text: string;
};

@Controller()
export class WorkerAiController {
  constructor(
    private readonly workerAiService: WorkerAiService,
    @InjectQueue('ai-embedding') private embeddingQueue: Queue,
    @InjectQueue('ai-ner') private nerQueue: Queue,
    @InjectQueue('ai-verify-source') private verifySourceQueue: Queue,
    @InjectQueue('ai-translation') private translationQueue: Queue,
    @InjectQueue('ai-analysis') private analysisQueue: Queue,
    @InjectQueue('ai-suggestions') private suggestionsQueue: Queue,
  ) {}

  @Get('health')
  health() {
    return this.workerAiService.status();
  }

  @Get('recent')
  recent() {
    return this.workerAiService.recentAnalyses();
  }

  @Get('tasks/status')
  async queueStatus() {
    return this.workerAiService.getQueueStatus();
  }

  @Post('tasks/retry/:queue/:id')
  async retryJob(@Param('queue') queueName: string, @Param('id') id: string) {
    const retried = await this.workerAiService.retryJob(queueName, id);
    return { status: retried ? 'retried' : 'not retried' };
  }

  @MessagePattern(TaskType.ANALYZE_SOURCE)
  async handleAnalyzeSource(@Payload() task: TaskMessage<AnalysisPayload>) {
    const job = await this.analysisQueue.add('analyze-source', task.payload, {
      jobId: task.id,
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });
    return { status: 'queued', jobId: job.id };
  }

  @MessagePattern(TaskType.GET_AI_SUGGESTIONS)
  async handleGetAiSuggestions(
    @Payload() task: TaskMessage<SuggestionsPayload>,
  ) {
    const job = await this.suggestionsQueue.add(
      'get-suggestions',
      task.payload,
      {
        jobId: task.id,
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      },
    );
    return { status: 'queued', jobId: job.id };
  }

  @MessagePattern(TaskType.AI_EMBEDDING)
  async handleEmbedding(@Payload() task: TaskMessage<any>) {
    const job = await this.embeddingQueue.add('embedding', task.payload, {
      jobId: task.id,
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });
    return { status: 'queued', jobId: job.id };
  }

  @MessagePattern(TaskType.AI_NER)
  async handleNer(@Payload() task: TaskMessage<any>) {
    const job = await this.nerQueue.add('ner', task.payload, {
      jobId: task.id,
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });
    return { status: 'queued', jobId: job.id };
  }

  @MessagePattern(TaskType.AI_VERIFY_SOURCE)
  async handleVerifySource(@Payload() task: TaskMessage<any>) {
    const job = await this.verifySourceQueue.add(
      'verify-source',
      task.payload,
      {
        jobId: task.id,
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      },
    );
    return { status: 'queued', jobId: job.id };
  }

  @MessagePattern(TaskType.AI_TRANSLATE)
  async handleTranslate(@Payload() task: TaskMessage<any>) {
    const job = await this.translationQueue.add('translation', task.payload, {
      jobId: task.id,
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });
    return { status: 'queued', jobId: job.id };
  }
}
