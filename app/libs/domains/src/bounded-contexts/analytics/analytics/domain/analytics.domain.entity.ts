import {
  MetricsPort,
  PaginatedResult,
  Query,
  TimeRangeFilter,
  TimeSeriesPort,
  UseCase,
} from '../../../../core';

export interface DashboardWidget {
  readonly code: string;
  readonly title: string;
  readonly description?: string;
}

export interface AnalyticsPoint {
  readonly timestamp: Date;
  readonly value: number;
  readonly labels?: Record<string, string>;
}

export interface AnalyticsDataset {
  readonly widgetCode: string;
  readonly points: readonly AnalyticsPoint[];
}

export interface AnalyticsPort extends TimeSeriesPort<AnalyticsPoint> {
  collect(range: TimeRangeFilter & { readonly widgetCode: string }): Promise<readonly AnalyticsPoint[]>;
}

export const ANALYTICS_PORT = Symbol('ANALYTICS_PORT');

export interface AnalyticsQuery extends Query {
  readonly payload: {
    readonly widgetCode: string;
    readonly range: TimeRangeFilter;
  };
}

export interface AnalyticsUseCases {
  readonly getDataset: UseCase<AnalyticsQuery, AnalyticsDataset>;
  readonly listWidgets: UseCase<Query, PaginatedResult<DashboardWidget>>;
}

export interface AnalyticsMetrics {
  readonly metrics: MetricsPort;
}

export const ANALYTICS_METRICS = Symbol('ANALYTICS_METRICS');

export interface AnalyticsIngestionPort {
  readonly metrics: MetricsPort;
  ingest(event: { readonly name: string; readonly value?: number; readonly labels?: Record<string, string> }): Promise<void>;
}

//TODO Wire up analytics ingestion with Prometheus/OpenTelemetry exporters.
