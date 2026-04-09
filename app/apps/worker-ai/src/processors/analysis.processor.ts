import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { WorkerAiService } from '../worker-ai.service';

@Processor('ai-analysis')
export class AnalysisProcessor extends WorkerHost {
  private readonly logger = new Logger(AnalysisProcessor.name);

  constructor(private readonly workerAiService: WorkerAiService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing analysis job ${job.id}`);
    try {
      const result = await this.workerAiService.runAnalyzeSource(job.data);
      await this.workerAiService.saveTaskResult({
        id: job.id as string,
        type: job.name,
        status: 'completed',
        result,
        completedAt: new Date(),
      });
      return result;
    } catch (error: any) {
      this.logger.error(`Failed analysis job ${job.id}: ${error.message}`);
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
