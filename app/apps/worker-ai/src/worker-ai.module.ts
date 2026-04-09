import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { WorkerAiController } from './worker-ai.controller';
import { WorkerAiService } from './worker-ai.service';
import { EmbeddingProcessor } from './processors/embedding.processor';
import { NerProcessor } from './processors/ner.processor';
import { VerifySourceProcessor } from './processors/verify-source.processor';
import { TranslationProcessor } from './processors/translation.processor';
import { AnalysisProcessor } from './processors/analysis.processor';
import { SuggestionsProcessor } from './processors/suggestions.processor';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiTaskRecordEntity } from './entities/ai-task.entity';
import {
  DatabaseConfigService,
  SharedKernelModule,
} from '@synop/shared-kernel';

@Module({
  imports: [
    SharedKernelModule,
    TypeOrmModule.forRootAsync({
      imports: [SharedKernelModule],
      inject: [DatabaseConfigService],
      useFactory: (config: DatabaseConfigService) => {
        const dbConfig = config.getConfigFromEnv();
        return {
          type: 'postgres',
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.user,
          password: dbConfig.password,
          database: dbConfig.database,
          entities: [AiTaskRecordEntity],
        };
      },
    }),
    TypeOrmModule.forFeature([AiTaskRecordEntity]),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    BullModule.registerQueue({ name: 'ai-embedding' }),
    BullModule.registerQueue({ name: 'ai-ner' }),
    BullModule.registerQueue({ name: 'ai-verify-source' }),
    BullModule.registerQueue({ name: 'ai-translation' }),
    BullModule.registerQueue({ name: 'ai-analysis' }),
    BullModule.registerQueue({ name: 'ai-suggestions' }),
  ],
  controllers: [WorkerAiController],
  providers: [
    WorkerAiService,
    EmbeddingProcessor,
    NerProcessor,
    VerifySourceProcessor,
    TranslationProcessor,
    AnalysisProcessor,
    SuggestionsProcessor,
  ],
})
export class WorkerAiModule {}
