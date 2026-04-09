import { BaseAggregate } from '../../../../core';
import { randomUUID } from 'crypto';
import {
  AdjustReputationCommand,
  ReputationEvent,
  ReputationLedgerAggregate,
  ReputationLedgerId,
  ReputationLedgerProps,
} from './reputation.domain.entity';

export class ReputationLedgerAggregateImpl
  extends BaseAggregate<ReputationLedgerId, ReputationLedgerProps, ReputationEvent>
  implements ReputationLedgerAggregate
{
  protected apply(event: ReputationEvent): void {
    const delta = event.payload.delta;

    // Check if the event has extended payload properties
    const historyEntry = {
        id: { value: randomUUID() },
        userId: event.payload.userId,
        delta: event.payload.delta,
        reason: (event.payload as any).reason || 'system.adjustment',
        occurredAt: event.occurredOn,
        referenceId: (event.payload as any).referenceId,
    };

    this.props = {
      ...this.props,
      total: this.props.total + delta,
      history: [
        ...(this.props.history || []),
        historyEntry
      ],
    };
  }

  adjust(command: AdjustReputationCommand): ReputationEvent {
    const event: ReputationEvent = {
      name: 'ReputationAdjustedEvent',
      occurredOn: new Date(),
      aggregateId: this.id.value,
      payload: {
        userId: command.userId,
        delta: command.delta,
        reason: command.reason,
        referenceId: command.referenceId,
      } as any,
    };
    this.record(event);
    return event;
  }
}
