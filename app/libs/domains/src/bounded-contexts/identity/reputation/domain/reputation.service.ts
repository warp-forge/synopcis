import { Inject, Injectable } from '@nestjs/common';
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
    @Inject(REPUTATION_ANALYTICS_PORT)
    private readonly analytics: ReputationAnalyticsPort,
    @Inject(REPUTATION_METRICS)
    private readonly metrics: ReputationMetrics,
  ) {}

  async adjust(command: AdjustReputationCommand): Promise<ReputationEvent> {
    // TODO: implement reputation adjustment logic
    throw new Error('ReputationDomainService.adjust not implemented');
  }

  async getTrend(
    query: GetReputationTrendQuery,
  ): Promise<readonly ReputationTrendPoint[]> {
    // TODO: implement reputation trend retrieval
    throw new Error('ReputationDomainService.getTrend not implemented');
  }

  async getUserReputationScore(userId: string): Promise<number> {
    try {
      const ledger = await this.repository.findByUserId(userId as any);
      return ledger ? ledger.props.total || 1 : 1;
    } catch {
      return 1;
    }
  }
}
