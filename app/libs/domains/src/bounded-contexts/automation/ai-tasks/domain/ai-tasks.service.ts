import { Inject, Injectable } from '@nestjs/common';
import {
  AI_TASK_REPOSITORY,
  AiTaskAggregate,
  CancelAiTaskCommand,
  CompleteAiTaskCommand,
  FailAiTaskCommand,
  RequestAiTaskCommand,
} from './ai-tasks.domain.entity';
import type { AiTaskRepository } from './ai-tasks.domain.entity';

@Injectable()
export class AiTasksDomainService {
  constructor(
    @Inject(AI_TASK_REPOSITORY)
    private readonly repository: AiTaskRepository,
  ) {}

  async request(command: RequestAiTaskCommand): Promise<AiTaskAggregate> {
    // TODO: implement AI task request logic
    throw new Error('AiTasksDomainService.request not implemented');
  }

  async complete(command: CompleteAiTaskCommand): Promise<AiTaskAggregate> {
    // TODO: implement AI task completion logic
    throw new Error('AiTasksDomainService.complete not implemented');
  }

  async fail(command: FailAiTaskCommand): Promise<AiTaskAggregate> {
    // TODO: implement AI task failure handling
    throw new Error('AiTasksDomainService.fail not implemented');
  }

  async cancel(command: CancelAiTaskCommand): Promise<AiTaskAggregate> {
    // TODO: implement AI task cancellation logic
    throw new Error('AiTasksDomainService.cancel not implemented');
  }
}
