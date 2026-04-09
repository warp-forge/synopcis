import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { WorkerAiController } from './worker-ai.controller';
import { WorkerAiService } from './worker-ai.service';
import { AiProcessor } from './ai.processor';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    BullModule.registerQueue({
      name: 'ai-tasks',
    }),
  ],
  controllers: [WorkerAiController],
  providers: [WorkerAiService, AiProcessor],
})
export class WorkerAiModule {}
