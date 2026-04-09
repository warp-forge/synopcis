import { Inject, Injectable } from '@nestjs/common';
import {
  GIT_MIRROR_HISTORY_PORT,
  GIT_MIRROR_REPOSITORY,
  GitMirrorAggregate,
  GitMirrorEvent,
  RecordGitMirrorResultCommand,
  ScheduleGitMirrorCommand,
} from './git-sync.domain.entity';
import type {
  GitMirrorHistoryPort,
  GitMirrorRepository,
} from './git-sync.domain.entity';

@Injectable()
export class GitSyncDomainService {
  constructor(
    @Inject(GIT_MIRROR_REPOSITORY)
    private readonly repository: GitMirrorRepository,
    @Inject(GIT_MIRROR_HISTORY_PORT)
    private readonly history: GitMirrorHistoryPort,
  ) {}

  async schedule(
    command: ScheduleGitMirrorCommand,
  ): Promise<GitMirrorAggregate> {
    // TODO: implement git mirror scheduling logic
    throw new Error('GitSyncDomainService.schedule not implemented');
  }

  async recordResult(
    command: RecordGitMirrorResultCommand,
  ): Promise<GitMirrorEvent> {
    // TODO: implement git mirror result recording logic
    throw new Error('GitSyncDomainService.recordResult not implemented');
  }
}
