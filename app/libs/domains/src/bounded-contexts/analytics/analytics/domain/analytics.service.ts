import { Inject, Injectable } from '@nestjs/common';
import {
  ANALYTICS_METRICS,
  ANALYTICS_PORT,
  AnalyticsDataset,
  AnalyticsQuery,
  DashboardWidget,
} from './analytics.domain.entity';
import type {
  AnalyticsMetrics,
  AnalyticsPort,
} from './analytics.domain.entity';

@Injectable()
export class AnalyticsDomainService {
  constructor(
    @Inject(ANALYTICS_PORT)
    private readonly analyticsPort: AnalyticsPort,
    @Inject(ANALYTICS_METRICS)
    private readonly analyticsMetrics: AnalyticsMetrics,
  ) {}

  async getDataset(query: AnalyticsQuery): Promise<AnalyticsDataset> {
    // TODO: implement analytics dataset retrieval
    throw new Error('AnalyticsDomainService.getDataset not implemented');
  }

  async listWidgets(): Promise<readonly DashboardWidget[]> {
    // TODO: implement analytics widget listing
    throw new Error('AnalyticsDomainService.listWidgets not implemented');
  }
}
