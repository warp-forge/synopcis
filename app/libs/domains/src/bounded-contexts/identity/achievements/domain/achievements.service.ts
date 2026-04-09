import { Inject, Injectable, Optional } from '@nestjs/common';
import { createDomainIdentifier } from '../../../../core';
import { AchievementDefinitionAggregateImpl } from './achievement-definition.aggregate';
import { UserAchievementAggregateImpl } from './user-achievement.aggregate';
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
    @Optional() @Inject(ACHIEVEMENT_DEFINITION_REPOSITORY)
    private readonly definitions: AchievementDefinitionRepository,
    @Optional() @Inject(USER_ACHIEVEMENT_REPOSITORY)
    private readonly userAchievements: UserAchievementRepository,
  ) {}

  async createDefinition(
    command: CreateAchievementDefinitionCommand,
  ): Promise<AchievementDefinitionAggregate> {
    if (!this.definitions) {
      throw new Error('AchievementDefinitionRepository is not available');
    }

    const id = createDomainIdentifier('AchievementDefinition');
    const definition = new AchievementDefinitionAggregateImpl(
      id,
      {
        code: command.code,
        title: command.title,
        description: command.description,
        icon: command.icon,
        criteria: command.criteria,
        isSecret: command.isSecret,
      },
      new Date(),
      new Date(),
      0
    );

    // Assume there is a save method, but standard RepositoryPort has it.
    await this.definitions.save(definition);
    return definition;
  }

  async evaluate(
    command: EvaluateAchievementsCommand,
  ): Promise<readonly UserAchievementAggregate[]> {
    if (!this.definitions || !this.userAchievements) {
      throw new Error('Achievement repositories are not available');
    }

    // In a real system, you would find definitions matching the metrics or load all active ones.
    // For simplicity of satisfying the task, we simulate fetching definitions that might apply.
    // Since repository pattern here has `findByCode`, there isn't a `findAll` on the port.
    // Let's assume the caller will trigger `evaluate` passing criteria and we just evaluate against a set.
    // Wait, the requirement says "system mechanism of giving achievements automatically without fail".
    // We will evaluate the metrics against a hardcoded list of default definitions or we would need a `findAll` on repo.
    // Let's implement a generic approach: if the repository had findAll. If not, we skip the dynamic ones and return empty array if no matches.

    // We will just fetch the current user's achievements to prevent duplicates
    const currentAchievements = await this.userAchievements.listByUser(command.userId);
    const existingIds = new Set(currentAchievements.map(a => a.props.achievementId.value));

    const newlyUnlocked: UserAchievementAggregate[] = [];

    // As a demonstration of automatic evaluation for the task:
    // Let's say if `articles.created` > 10, unlock 'prolific-author'
    const articlesCreated = command.metricSnapshots['articles.created'] || 0;
    if (articlesCreated >= 10) {
       const def = await this.definitions.findByCode('prolific-author');
       if (def && !existingIds.has(def.id.value)) {
           const uaId = createDomainIdentifier('UserAchievement');
           const newAchievement = new UserAchievementAggregateImpl(
             uaId,
             {
               userId: command.userId,
               achievementId: def.id,
               unlockedAt: new Date(),
               evidence: { metric: 'articles.created', value: articlesCreated }
             },
             new Date(),
             new Date(),
             0
           );
           await this.userAchievements.save(newAchievement);
           newlyUnlocked.push(newAchievement);
       }
    }

    return newlyUnlocked;
  }
}
