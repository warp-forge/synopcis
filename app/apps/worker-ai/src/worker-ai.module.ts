import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkerAiController } from './worker-ai.controller';
import { WorkerAiService } from './worker-ai.service';
import { AiTaskEntity } from './worker-ai.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AiTaskEntity])],
  controllers: [WorkerAiController],
  providers: [WorkerAiService],
})
export class WorkerAiModule {}
