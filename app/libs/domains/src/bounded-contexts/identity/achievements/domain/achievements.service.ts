import { Inject, Injectable } from '@nestjs/common';
import {
  ACHIEVEMENT_DEFINITION_REPOSITORY,
  AchievementDefinitionAggregate,
  CreateAchievementDefinitionCommand,
  EvaluateAchievementsCommand,
  USER_ACHIEVEMENT_REPOSITORY,
  UserAchievementAggregate,
} from './achievements.domain.entity';
import type {
  AchievementDefinitionRepository,
  UserAchievementRepository,
} from './achievements.domain.entity';

@Injectable()
export class AchievementsDomainService {
  constructor(
    @Inject(ACHIEVEMENT_DEFINITION_REPOSITORY)
    private readonly definitions: AchievementDefinitionRepository,
    @Inject(USER_ACHIEVEMENT_REPOSITORY)
    private readonly userAchievements: UserAchievementRepository,
  ) {}

  async createDefinition(
    command: CreateAchievementDefinitionCommand,
  ): Promise<AchievementDefinitionAggregate> {
    // TODO: implement achievement definition creation logic
    throw new Error(
      'AchievementsDomainService.createDefinition not implemented',
    );
  }

  async evaluate(
    command: EvaluateAchievementsCommand,
  ): Promise<readonly UserAchievementAggregate[]> {
    // TODO: implement achievement evaluation logic
    throw new Error('AchievementsDomainService.evaluate not implemented');
  }
}
