import { Module } from '@nestjs/common';
import { SharedKernelModule } from '@synop/shared-kernel';
import { ReputationDomainService } from './domain/reputation.service';
import { UsersDomainModule } from '../users/users.module';
import { REPUTATION_LEDGER_REPOSITORY, REPUTATION_ANALYTICS_PORT, REPUTATION_METRICS } from './domain/reputation.domain.entity';
import { PgReputationLedgerRepository } from './adapters/pg-reputation-ledger.repository';

@Module({
  imports: [UsersDomainModule, SharedKernelModule],
  providers: [
    ReputationDomainService,
    { provide: REPUTATION_LEDGER_REPOSITORY, useClass: PgReputationLedgerRepository },
    { provide: REPUTATION_ANALYTICS_PORT, useValue: { collect: async () => [] } },
    { provide: REPUTATION_METRICS, useValue: { weighting: () => null } },
  ],
  exports: [ReputationDomainService, REPUTATION_LEDGER_REPOSITORY],
})
export class ReputationDomainModule {}
