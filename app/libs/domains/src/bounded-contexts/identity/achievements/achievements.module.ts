import { Module } from '@nestjs/common';
import { AchievementsDomainService } from './domain/achievements.service';
import { ACHIEVEMENT_DEFINITION_REPOSITORY, USER_ACHIEVEMENT_REPOSITORY } from './domain/achievements.domain.entity';

@Module({
  providers: [
    AchievementsDomainService,
    { provide: ACHIEVEMENT_DEFINITION_REPOSITORY, useValue: { findByCode: async () => null, save: async () => {} } },
    { provide: USER_ACHIEVEMENT_REPOSITORY, useValue: { listByUser: async () => [], save: async () => {} } },
  ],
  exports: [AchievementsDomainService, USER_ACHIEVEMENT_REPOSITORY],
})
export class AchievementsDomainModule {}
