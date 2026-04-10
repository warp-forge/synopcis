import { Module } from '@nestjs/common';
import { SharedKernelModule } from '@synop/shared-kernel';
import { GitController } from './git.controller';
import { GitService } from './git.service';

@Module({
  imports: [SharedKernelModule],
  controllers: [GitController],
  providers: [GitService],
})
export class GitModule {}
