import { Module } from '@nestjs/common';
import { SharedKernelModule } from '@synop/shared-kernel';
import { AchievementsDomainService } from './domain/achievements.service';
import { ACHIEVEMENT_DEFINITION_REPOSITORY, USER_ACHIEVEMENT_REPOSITORY } from './domain/achievements.domain.entity';
import { PgAchievementDefinitionRepository, PgUserAchievementRepository } from './adapters/pg-achievement.repositories';

@Module({
  imports: [SharedKernelModule],
  providers: [
    AchievementsDomainService,
    { provide: ACHIEVEMENT_DEFINITION_REPOSITORY, useClass: PgAchievementDefinitionRepository },
    { provide: USER_ACHIEVEMENT_REPOSITORY, useClass: PgUserAchievementRepository },
  ],
  exports: [AchievementsDomainService, USER_ACHIEVEMENT_REPOSITORY],
})
export class AchievementsDomainModule {}
