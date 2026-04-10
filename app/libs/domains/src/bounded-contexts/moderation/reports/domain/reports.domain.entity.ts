import {
  AggregateRoot,
  Command,
  DomainEvent,
  Identifier,
  RepositoryPort,
  UUID,
  UseCase,
  ValueObject,
} from '../../../../core';

export type ReportId = Identifier;

export type ReportTargetType = 'article' | 'block' | 'comment' | 'user';

export interface ReportTarget extends ValueObject<{ readonly id: UUID; readonly type: ReportTargetType }> {}

export type ReportStatus = 'pending' | 'in-review' | 'resolved' | 'rejected';

export interface ModerationAction extends ValueObject<{ readonly action: string }> {
  readonly performedBy: UUID;
  readonly performedAt: Date;
  readonly notes?: string;
}

export interface ReportProps {
  readonly target: ReportTarget;
  readonly reason: string;
  readonly description?: string;
  readonly reporterId: UUID;
  readonly status: ReportStatus;
  readonly assignedModeratorId?: UUID;
  readonly actions: readonly ModerationAction[];
}

export interface ReportAggregate extends AggregateRoot<ReportId, ReportProps, ReportEvent> {}

export type ReportEvent =
  | ReportFiledEvent
  | ReportAssignedEvent
  | ReportResolvedEvent
  | ReportRejectedEvent;

export interface ReportFiledEvent extends DomainEvent<{ readonly target: ReportTarget; readonly reporterId: UUID }> {}

export interface ReportAssignedEvent
  extends DomainEvent<{ readonly moderatorId: UUID; readonly auto: boolean }> {}

export interface ReportResolvedEvent
  extends DomainEvent<{ readonly action: ModerationAction }> {}

export interface ReportRejectedEvent extends DomainEvent<{ readonly reason: string }> {}

export interface ReportRepository extends RepositoryPort<ReportAggregate, ReportId> {
  listOpen(): Promise<readonly ReportAggregate[]>;
}

export const REPORT_REPOSITORY = Symbol('REPORT_REPOSITORY');

export interface FileReportCommand {
  readonly target: ReportTarget;
  readonly reason: string;
  readonly description?: string;
  readonly reporterId: UUID;
}

export interface AssignReportCommand {
  readonly reportId: ReportId;
  readonly moderatorId: UUID;
}

export interface ResolveReportCommand {
  readonly reportId: ReportId;
  readonly moderatorId: UUID;
  readonly action: ModerationAction;
}

export interface RejectReportCommand {
  readonly reportId: ReportId;
  readonly moderatorId: UUID;
  readonly reason: string;
}

export type ReportUseCase<
  TCommand extends Command,
  TResult,
> = UseCase<TCommand, TResult>;
