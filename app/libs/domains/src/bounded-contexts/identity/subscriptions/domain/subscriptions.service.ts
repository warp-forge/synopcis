import { Inject, Injectable } from '@nestjs/common';
import {
  SUBSCRIPTION_REPOSITORY,
  SubscriptionAggregate,
  CancelSubscriptionCommand,
  CreateSubscriptionCommand,
  ToggleSubscriptionMuteCommand,
} from './subscriptions.domain.entity';
import type {
  SubscriptionRepository,
} from './subscriptions.domain.entity';

@Injectable()
export class SubscriptionsDomainService {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly repository: SubscriptionRepository,
  ) {}

  async create(command: CreateSubscriptionCommand): Promise<SubscriptionAggregate> {
    // TODO: implement subscription creation logic
    throw new Error('SubscriptionsDomainService.create not implemented');
  }

  async cancel(command: CancelSubscriptionCommand): Promise<void> {
    // TODO: implement subscription cancellation logic
    throw new Error('SubscriptionsDomainService.cancel not implemented');
  }

  async toggleMute(
    command: ToggleSubscriptionMuteCommand,
  ): Promise<SubscriptionAggregate> {
    // TODO: implement subscription mute toggling logic
    throw new Error('SubscriptionsDomainService.toggleMute not implemented');
  }
}
