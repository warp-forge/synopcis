import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { WorkerAiService } from '../worker-ai.service';

@Processor('ai-verify-source')
export class VerifySourceProcessor extends WorkerHost {
  private readonly logger = new Logger(VerifySourceProcessor.name);

  constructor(private readonly workerAiService: WorkerAiService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing verify source job ${job.id}`);
    try {
      const result = await this.workerAiService.runVerifySource(job.data);
      await this.workerAiService.saveTaskResult({
        id: job.id as string,
        type: job.name,
        status: 'completed',
        result,
        completedAt: new Date(),
      });
      return result;
    } catch (error: any) {
      this.logger.error(`Failed verify source job ${job.id}: ${error.message}`);
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
