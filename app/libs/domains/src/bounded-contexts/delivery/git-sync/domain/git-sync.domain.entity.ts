import {
  AggregateRoot,
  DomainEvent,
  Identifier,
  RepositoryPort,
  TimeRangeFilter,
  UUID,
  UseCase,
} from '../../../../core';

export type GitMirrorId = Identifier;

export interface GitMirrorProps {
  readonly articleSlug: string;
  readonly localPath: string;
  readonly remoteUrl: string;
  readonly lastMirroredAt?: Date;
  readonly lastCommitHash?: string;
  readonly failureCount: number;
}

export interface GitMirrorAggregate
  extends AggregateRoot<GitMirrorId, GitMirrorProps, GitMirrorEvent> {}

export interface GitMirrorEvent
  extends DomainEvent<{ readonly articleSlug: string; readonly status: 'success' | 'failed' }> {}

export interface ScheduleGitMirrorCommand {
  readonly articleSlug: string;
  readonly triggeredBy: UUID;
}

export interface RecordGitMirrorResultCommand {
  readonly mirrorId: GitMirrorId;
  readonly status: 'success' | 'failed';
  readonly commitHash?: string;
  readonly errorMessage?: string;
}

export interface GitMirrorRepository
  extends RepositoryPort<GitMirrorAggregate, GitMirrorId> {
  findBySlug(slug: string): Promise<GitMirrorAggregate | null>;
}

export const GIT_MIRROR_REPOSITORY = Symbol('GIT_MIRROR_REPOSITORY');

export interface GitMirrorUseCases {
  readonly scheduleMirror: UseCase<any, GitMirrorAggregate>;
  readonly recordMirror: UseCase<any, GitMirrorEvent>;
}

export interface GitMirrorHistoryPort {
  listFailures(range: TimeRangeFilter): Promise<readonly GitMirrorEvent[]>;
}

export const GIT_MIRROR_HISTORY_PORT = Symbol('GIT_MIRROR_HISTORY_PORT');

//TODO Implement GitMirror aggregate once git adapters are introduced.
