import { Module } from '@nestjs/common';
import { ReputationDomainService } from './domain/reputation.service';
import { UsersDomainModule } from '../users/users.module';
import { REPUTATION_LEDGER_REPOSITORY, REPUTATION_ANALYTICS_PORT, REPUTATION_METRICS } from './domain/reputation.domain.entity';
import { InMemoryReputationLedgerRepository } from './adapters/in-memory-reputation-ledger.repository';

@Module({
  imports: [UsersDomainModule],
  providers: [
    ReputationDomainService,
    { provide: REPUTATION_LEDGER_REPOSITORY, useClass: InMemoryReputationLedgerRepository },
    { provide: REPUTATION_ANALYTICS_PORT, useValue: { collect: async () => [] } },
    { provide: REPUTATION_METRICS, useValue: { weighting: () => null } },
  ],
  exports: [ReputationDomainService, REPUTATION_LEDGER_REPOSITORY],
})
export class ReputationDomainModule {}
