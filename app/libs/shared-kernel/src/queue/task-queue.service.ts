import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import {
  EMPTY,
  Observable,
  Subject,
  Subscription,
  catchError,
  concatMap,
  filter,
  from,
  tap,
} from 'rxjs';
import {
  TaskHandlerResult,
  TaskMessage,
  TaskProcessingError,
  TaskType,
} from '../events';

export type TaskHandler<TPayload = Record<string, unknown>> = (
  task: TaskMessage<TPayload>,
) => Promise<TaskHandlerResult | void> | TaskHandlerResult | void;

export interface ConsumeOptions {
  readonly description?: string;
}

@Injectable()
export class TaskQueueService implements OnModuleDestroy {
  private readonly logger = new Logger(TaskQueueService.name);
  private readonly stream$ = new Subject<
    TaskMessage<Record<string, unknown>>
  >();
  private readonly errors$ = new Subject<TaskProcessingError>();
  private readonly subscriptions = new Set<Subscription>();

  publish<TPayload extends Record<string, unknown>>(
    task: TaskMessage<TPayload>,
  ): void {
    this.logger.debug(`Publishing task ${task.type} (${task.id})`);
    this.stream$.next(task);
  }

  onTask<TPayload extends Record<string, unknown>>(
    type: TaskType,
  ): Observable<TaskMessage<TPayload>> {
    return this.stream$.pipe(
      filter((task) => task.type === type),
    ) as Observable<TaskMessage<TPayload>>;
  }

  consume<TPayload extends Record<string, unknown>>(
    type: TaskType,
    handler: TaskHandler<TPayload>,
    options?: ConsumeOptions,
  ): Subscription {
    const subscription = this.onTask<TPayload>(type)
      .pipe(
        concatMap((task) =>
          from(Promise.resolve().then(() => handler(task))).pipe(
            tap((result) => {
              if (!result) {
                this.logger.log(
                  `Task ${task.id} (${task.type}) processed without explicit result`,
                );
                return;
              }

              if (result.status === 'failed') {
                const error = new Error(result.detail ?? 'Task failed');
                this.emitError(task as any, error);
                return;
              }

              this.logger.log(
                `Task ${result.taskId} (${result.type}) completed: ${
                  result.detail ?? 'ok'
                }`,
              );
            }),
            catchError((error) => {
              this.emitError(task as any, this.normalizeError(error));
              return EMPTY;
            }),
          ),
        ),
      )
      .subscribe();

    if (options?.description) {
      this.logger.log(
        `Registered handler for ${type} (${options.description})`,
      );
    } else {
      this.logger.log(`Registered handler for ${type}`);
    }

    this.subscriptions.add(subscription);
    return subscription;
  }

  errors(): Observable<TaskProcessingError> {
    return this.errors$.asObservable();
  }

  onModuleDestroy(): void {
    this.logger.log('Shutting down task queue');
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
    this.subscriptions.clear();
    this.stream$.complete();
    this.errors$.complete();
  }

  private emitError(task: TaskMessage, error: Error): void {
    const payload: TaskProcessingError = {
      task,
      error,
    };

    this.logger.error(
      `Task ${task.id} (${task.type}) failed: ${error.message}`,
      error.stack,
    );
    this.errors$.next(payload);
  }

  private normalizeError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }

    if (typeof error === 'string') {
      return new Error(error);
    }

    return new Error(JSON.stringify(error));
  }
}
