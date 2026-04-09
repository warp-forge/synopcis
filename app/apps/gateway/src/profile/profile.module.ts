import { Module } from '@nestjs/common';
import {
  UsersDomainModule,
  ReputationDomainModule,
  AchievementsDomainModule,
} from '@synop/domains/bounded-contexts/identity';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [UsersDomainModule, ReputationDomainModule, AchievementsDomainModule],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
