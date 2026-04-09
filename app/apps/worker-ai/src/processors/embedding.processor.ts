import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { WorkerAiService } from '../worker-ai.service';

@Processor('ai-embedding')
export class EmbeddingProcessor extends WorkerHost {
  private readonly logger = new Logger(EmbeddingProcessor.name);

  constructor(private readonly workerAiService: WorkerAiService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing embedding job ${job.id}`);
    try {
      const result = await this.workerAiService.runEmbedding(job.data);
      await this.workerAiService.saveTaskResult({
        id: job.id as string,
        type: job.name,
        status: 'completed',
        result,
        completedAt: new Date(),
      });
      return result;
    } catch (error: any) {
      this.logger.error(`Failed embedding job ${job.id}: ${error.message}`);
      await this.workerAiService.saveTaskResult({
        id: job.id as string,
        type: job.name,
        status: 'failed',
        error: error.message,
        completedAt: new Date(),
      });
      throw error;
    }
  }
}
