import {
  AggregateRoot,
  DomainEvent,
  Identifier,
  RepositoryPort,
  UUID,
  UseCase,
  ValueObject,
  Command,
} from '../../../../core';

export type AiTaskId = Identifier;

export type AiTaskType =
  | 'concept-suggestion'
  | 'source-analysis'
  | 'translation'
  | 'embedding-generation'
  | 'summarization';

export type AiTaskStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface AiTaskPayload extends ValueObject<Record<string, unknown>> {
  readonly priority: 'low' | 'normal' | 'high';
  readonly inputReference: string;
}

export interface AiTaskResult extends ValueObject<Record<string, unknown>> {
  readonly outputReference?: string;
  readonly summary?: string;
  readonly error?: string;
}

export interface AiTaskProps {
  readonly type: AiTaskType;
  readonly status: AiTaskStatus;
  readonly payload: AiTaskPayload;
  readonly requestedBy: UUID;
  readonly assignedWorkerId?: UUID;
  readonly result?: AiTaskResult;
  readonly startedAt?: Date;
  readonly completedAt?: Date;
  readonly attempts: number;
}

export interface AiTaskAggregate extends AggregateRoot<AiTaskId, AiTaskProps, AiTaskEvent> {}

export type AiTaskEvent =
  | AiTaskCreatedEvent
  | AiTaskAssignedEvent
  | AiTaskCompletedEvent
  | AiTaskFailedEvent
  | AiTaskCancelledEvent;

export interface AiTaskCreatedEvent extends DomainEvent<{ readonly type: AiTaskType; readonly payload: AiTaskPayload }> {}

export interface AiTaskAssignedEvent
  extends DomainEvent<{ readonly workerId: UUID; readonly startedAt: Date }> {}

export interface AiTaskCompletedEvent extends DomainEvent<{ readonly result: AiTaskResult }> {}

export interface AiTaskFailedEvent extends DomainEvent<{ readonly error: string; readonly attempts: number }> {}

export interface AiTaskCancelledEvent extends DomainEvent<{ readonly cancelledBy: UUID }> {}

export interface AiTaskRepository extends RepositoryPort<AiTaskAggregate, AiTaskId> {
  findNextPending(types: readonly AiTaskType[]): Promise<AiTaskAggregate | null>;
  listStalled(since: Date): Promise<readonly AiTaskAggregate[]>;
}

export const AI_TASK_REPOSITORY = Symbol('AI_TASK_REPOSITORY');

export interface RequestAiTaskCommand {
  readonly type: AiTaskType;
  readonly payload: AiTaskPayload;
  readonly requestedBy: UUID;
}

export interface CompleteAiTaskCommand {
  readonly taskId: AiTaskId;
  readonly workerId: UUID;
  readonly result: AiTaskResult;
}

export interface FailAiTaskCommand {
  readonly taskId: AiTaskId;
  readonly workerId: UUID;
  readonly error: string;
}

export interface CancelAiTaskCommand {
  readonly taskId: AiTaskId;
  readonly cancelledBy: UUID;
}

export type AiTaskUseCase<TCommand extends Command<unknown>, TResult> = UseCase<TCommand, TResult>;
