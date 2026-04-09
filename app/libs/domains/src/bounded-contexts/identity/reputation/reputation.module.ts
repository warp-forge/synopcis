import { Module } from '@nestjs/common';
import { ReputationDomainService } from './domain/reputation.service';
import { UsersDomainModule } from '../users/users.module';

@Module({
  imports: [UsersDomainModule],
  providers: [ReputationDomainService],
  exports: [ReputationDomainService],
})
export class ReputationDomainModule {}
