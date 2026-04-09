import { Test, TestingModule } from '@nestjs/testing';
import { ReputationDomainService } from './reputation.service';
import { UsersDomainService } from '../../users/domain/users.service';
import {
  REPUTATION_LEDGER_REPOSITORY,
  REPUTATION_ANALYTICS_PORT,
  REPUTATION_METRICS,
} from './reputation.domain.entity';
import { ReputationLedgerAggregateImpl } from './reputation-ledger.aggregate';

describe('ReputationDomainService', () => {
  let service: ReputationDomainService;
  let repository: any;
  let analytics: any;
  let metrics: any;
  let usersDomainService: any;

  beforeEach(async () => {
    repository = {
      findByUserId: jest.fn(),
      save: jest.fn(),
    };
    analytics = {
      collect: jest.fn(),
    };
    metrics = {
      weighting: jest.fn(),
    };
    usersDomainService = {
      syncReputation: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReputationDomainService,
        { provide: REPUTATION_LEDGER_REPOSITORY, useValue: repository },
        { provide: REPUTATION_ANALYTICS_PORT, useValue: analytics },
        { provide: REPUTATION_METRICS, useValue: metrics },
        { provide: UsersDomainService, useValue: usersDomainService },
      ],
    }).compile();

    service = module.get<ReputationDomainService>(ReputationDomainService);
  });

  it('should create a ledger if none exists and adjust karma', async () => {
    repository.findByUserId.mockResolvedValue(null);
    metrics.weighting.mockReturnValue({ score: 10, weight: 1 });

    const event = await service.adjust({
      userId: 'user-1',
      delta: 5, // Should be overridden by metrics
      reason: 'contribution.accepted',
    });

    expect(repository.save).toHaveBeenCalled();
    const savedLedger = repository.save.mock.calls[0][0] as ReputationLedgerAggregateImpl;
    expect(savedLedger.props.userId).toBe('user-1');
    expect(savedLedger.props.total).toBe(10);
    expect(savedLedger.props.history.length).toBe(1);
    expect(event.payload.delta).toBe(10);
    expect(usersDomainService.syncReputation).toHaveBeenCalledWith('user-1', 10);
  });

  it('should adjust karma for existing ledger', async () => {
    const existingLedger = new ReputationLedgerAggregateImpl(
      { value: 'ledger-1', brand: 'ReputationLedger' } as any,
      { userId: 'user-1', total: 50, history: [] },
      new Date(),
      new Date(),
      0
    );
    repository.findByUserId.mockResolvedValue(existingLedger);
    metrics.weighting.mockReturnValue({ score: -5, weight: 1 });

    const event = await service.adjust({
      userId: 'user-1',
      delta: 0,
      reason: 'moderation.penalty',
    });

    expect(repository.save).toHaveBeenCalledWith(existingLedger);
    expect(existingLedger.props.total).toBe(45);
    expect(event.payload.delta).toBe(-5);
    expect(usersDomainService.syncReputation).toHaveBeenCalledWith('user-1', -5);
  });

  it('should get trend', async () => {
    analytics.collect.mockResolvedValue([{ occurredAt: new Date(), total: 10 }]);
    const trend = await service.getTrend({ userId: 'user-1', range: {} });
    expect(trend).toHaveLength(1);
    expect(analytics.collect).toHaveBeenCalledWith({ userId: 'user-1' });
  });
});
