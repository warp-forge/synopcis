import { Inject, Injectable } from '@nestjs/common';
import {
  RENDER_JOB_REPOSITORY,
  CompleteRenderCommand,
  FailRenderCommand,
  RenderJobAggregate,
  RenderJobEvent,
  ScheduleRenderCommand,
} from './rendering.domain.entity';
import type { RenderJobRepository } from './rendering.domain.entity';

@Injectable()
export class RenderingDomainService {
  constructor(
    @Inject(RENDER_JOB_REPOSITORY)
    private readonly repository: RenderJobRepository,
  ) {}

  async schedule(command: ScheduleRenderCommand): Promise<RenderJobEvent> {
    // TODO: implement render scheduling logic
    throw new Error('RenderingDomainService.schedule not implemented');
  }

  async complete(command: CompleteRenderCommand): Promise<RenderJobAggregate> {
    // TODO: implement render completion logic
    throw new Error('RenderingDomainService.complete not implemented');
  }

  async fail(command: FailRenderCommand): Promise<RenderJobAggregate> {
    // TODO: implement render failure logic
    throw new Error('RenderingDomainService.fail not implemented');
  }
}
