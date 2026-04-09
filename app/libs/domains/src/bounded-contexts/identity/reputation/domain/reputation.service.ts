import { Inject, Injectable, Optional } from '@nestjs/common';
import { createDomainIdentifier } from '../../../../core';
import { ReputationLedgerAggregateImpl } from './reputation-ledger.aggregate';
import { UsersDomainService } from '../../users/domain/users.service';
import {
  AdjustReputationCommand,
  GetReputationTrendQuery,
  REPUTATION_ANALYTICS_PORT,
  REPUTATION_LEDGER_REPOSITORY,
  REPUTATION_METRICS,
  ReputationEvent,
  ReputationTrendPoint,
} from './reputation.domain.entity';
import type {
  ReputationAnalyticsPort,
  ReputationLedgerRepository,
  ReputationMetrics,
} from './reputation.domain.entity';

@Injectable()
export class ReputationDomainService {
  constructor(
    @Inject(REPUTATION_LEDGER_REPOSITORY)
    private readonly repository: ReputationLedgerRepository,
    @Optional() @Inject(REPUTATION_ANALYTICS_PORT)
    private readonly analytics: ReputationAnalyticsPort,
    @Optional() @Inject(REPUTATION_METRICS)
    private readonly metrics: ReputationMetrics,
    @Optional() private readonly usersDomainService?: UsersDomainService,
  ) {}

  async adjust(command: AdjustReputationCommand): Promise<ReputationEvent> {
    const existingLedger = await this.repository.findByUserId(command.userId);
    let ledgerImpl: ReputationLedgerAggregateImpl;

    if (!existingLedger) {
      const id = createDomainIdentifier('ReputationLedger');
      ledgerImpl = new ReputationLedgerAggregateImpl(
        id,
        { userId: command.userId, total: 0, history: [] },
        new Date(),
        new Date(),
        0,
      );
    } else if (existingLedger instanceof ReputationLedgerAggregateImpl) {
      ledgerImpl = existingLedger;
    } else {
      ledgerImpl = new ReputationLedgerAggregateImpl(
        existingLedger.id,
        existingLedger.props,
        existingLedger.createdAt,
        existingLedger.updatedAt,
        existingLedger.version
      );
    }

    let delta = command.delta;
    if (this.metrics && command.reason) {
        const weightedScore = this.metrics.weighting(command.reason);
        if (weightedScore) {
             delta = weightedScore.score * weightedScore.weight;
        }
    }

    const adjustCommand = { ...command, delta };
    const event = ledgerImpl.adjust(adjustCommand);
    await this.repository.save(ledgerImpl);

    // Synchronize to user aggregate for karma rights checks
    if (this.usersDomainService) {
        await this.usersDomainService.syncReputation(command.userId, delta);
    }

    return event;
  }

  async getTrend(
    query: GetReputationTrendQuery,
  ): Promise<readonly ReputationTrendPoint[]> {
    if (!this.analytics) {
        throw new Error('ReputationAnalyticsPort not provided');
    }
    return this.analytics.collect({ userId: query.userId, ...query.range });
  }
}
