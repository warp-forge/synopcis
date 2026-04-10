import { Module } from '@nestjs/common';
import { TaskQueueService } from './queue/task-queue.service';
import { LocalGitRepositoryClient } from './integrations/git/git-repository.client';

@Module({
  providers: [TaskQueueService, LocalGitRepositoryClient],
  exports: [TaskQueueService, LocalGitRepositoryClient],
})
export class SharedKernelModule {}
