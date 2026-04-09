import { Module } from '@nestjs/common';
import { AchievementsDomainService } from './domain/achievements.service';
import { ACHIEVEMENT_DEFINITION_REPOSITORY, USER_ACHIEVEMENT_REPOSITORY } from './domain/achievements.domain.entity';
import { InMemoryAchievementDefinitionRepository, InMemoryUserAchievementRepository } from './adapters/in-memory-achievement.repositories';

@Module({
  providers: [
    AchievementsDomainService,
    { provide: ACHIEVEMENT_DEFINITION_REPOSITORY, useClass: InMemoryAchievementDefinitionRepository },
    { provide: USER_ACHIEVEMENT_REPOSITORY, useClass: InMemoryUserAchievementRepository },
  ],
  exports: [AchievementsDomainService, USER_ACHIEVEMENT_REPOSITORY],
})
export class AchievementsDomainModule {}
