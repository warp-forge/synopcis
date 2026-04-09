import { BaseAggregate } from '../../../../core';
import {
  UserId,
  UserProps,
  UserEvent,
  UserAggregate,
  UserRestrictionAppliedEvent,
} from './users.domain.entity';

export class UserAggregateImpl extends BaseAggregate<UserId, UserProps, UserEvent> implements UserAggregate {
  protected apply(event: UserEvent): void {
    if (event.name === 'UserRestrictionAppliedEvent') {
      const payload = (event as UserRestrictionAppliedEvent).payload;
      this.props = {
        ...this.props,
        restrictions: payload.restriction,
      };
    } else if (event.name === 'UserRestrictionLiftedEvent') {
      this.props = {
        ...this.props,
        restrictions: undefined,
      };
    }
  }

  updateReputation(delta: number): void {
    // Safely handle uninitialized reputation
    const currentReputation = this.props.reputation || 0;
    const newReputation = currentReputation + delta;

    this.props = {
      ...this.props,
      reputation: newReputation,
    };

    if (newReputation < 0 && !this.props.restrictions) {
      // Karma dropped below zero, apply restriction
      const event: UserRestrictionAppliedEvent = {
        name: 'UserRestrictionAppliedEvent',
        occurredOn: new Date(),
        aggregateId: this.id.value,
        payload: {
          restriction: {
            reason: 'Negative Karma Restriction',
            until: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 1 week
            imposedBy: 'system',
          },
        },
      };
      this.record(event);
    } else if (newReputation >= 0 && this.props.restrictions?.reason === 'Negative Karma Restriction') {
       const liftEvent = {
        name: 'UserRestrictionLiftedEvent',
        occurredOn: new Date(),
        aggregateId: this.id.value,
        payload: {
          restrictionId: this.id.value, // Just using ID for simplicity
        },
      };
      this.record(liftEvent as any);
    }
  }
}
