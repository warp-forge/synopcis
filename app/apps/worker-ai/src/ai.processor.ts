import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { WorkerAiService } from './worker-ai.service';
import { Logger } from '@nestjs/common';

@Processor('ai-tasks')
export class AiProcessor extends WorkerHost {
  private readonly logger = new Logger(AiProcessor.name);

  constructor(private readonly workerAiService: WorkerAiService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);

    try {
      let result: any;
      switch (job.name) {
        case 'embedding':
          // Mock embedding generation
          result = [0.1, 0.2, 0.3];
          break;
        case 'ner':
          // Mock Named Entity Recognition
          result = ['entity1', 'entity2'];
          break;
        case 'verify-source':
          // Mock source verification
          result = true;
          break;
        case 'translation':
          // Mock translation
          result = 'translated text';
          break;
        case 'analyze-source':
          // Run analysis based on job data payload
          result = this.workerAiService.runAnalyzeSource(job.data);
          break;
        case 'get-suggestions':
          // Run suggestions based on job data payload
          result = this.workerAiService.runGetSuggestions(job.data);
          break;
        default:
          throw new Error(`Unknown job type: ${job.name}`);
      }

      this.workerAiService.saveTaskResult({
        id: job.id as string,
        type: job.name,
        status: 'completed',
        result,
        completedAt: new Date(),
      });

      return result;
    } catch (error: any) {
      this.logger.error(`Failed to process job ${job.id}: ${error.message}`);

      this.workerAiService.saveTaskResult({
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
