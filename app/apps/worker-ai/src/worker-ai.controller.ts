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
    @InjectQueue('ai-tasks') private aiQueue: Queue,
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

  @Post('tasks/retry/:id')
  async retryJob(@Param('id') id: string) {
    const retried = await this.workerAiService.retryJob(id);
    return { status: retried ? 'retried' : 'not retried' };
  }

  @MessagePattern(TaskType.ANALYZE_SOURCE)
  async handleAnalyzeSource(@Payload() task: TaskMessage<AnalysisPayload>) {
    const job = await this.aiQueue.add('analyze-source', task.payload, {
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
    const job = await this.aiQueue.add('get-suggestions', task.payload, {
      jobId: task.id,
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });
    return { status: 'queued', jobId: job.id };
  }

  @MessagePattern(TaskType.AI_EMBEDDING)
  async handleEmbedding(@Payload() task: TaskMessage<any>) {
    const job = await this.aiQueue.add('embedding', task.payload, {
      jobId: task.id,
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });
    return { status: 'queued', jobId: job.id };
  }

  @MessagePattern(TaskType.AI_NER)
  async handleNer(@Payload() task: TaskMessage<any>) {
    const job = await this.aiQueue.add('ner', task.payload, {
      jobId: task.id,
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });
    return { status: 'queued', jobId: job.id };
  }

  @MessagePattern(TaskType.AI_VERIFY_SOURCE)
  async handleVerifySource(@Payload() task: TaskMessage<any>) {
    const job = await this.aiQueue.add('verify-source', task.payload, {
      jobId: task.id,
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });
    return { status: 'queued', jobId: job.id };
  }

  @MessagePattern(TaskType.AI_TRANSLATE)
  async handleTranslate(@Payload() task: TaskMessage<any>) {
    const job = await this.aiQueue.add('translation', task.payload, {
      jobId: task.id,
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });
    return { status: 'queued', jobId: job.id };
  }
}
