import { Injectable } from '@nestjs/common';
import {
  AchievementDefinitionRepository,
  UserAchievementRepository,
  AchievementDefinitionAggregate,
  UserAchievementAggregate,
  AchievementId,
  UserAchievementId
} from '../domain/achievements.domain.entity';

@Injectable()
export class InMemoryAchievementDefinitionRepository implements AchievementDefinitionRepository {
  private readonly definitions = new Map<string, AchievementDefinitionAggregate>();

  async findById(id: AchievementId): Promise<AchievementDefinitionAggregate | null> {
    return this.definitions.get(id.value) || null;
  }

  async findByCode(code: string): Promise<AchievementDefinitionAggregate | null> {
    for (const def of this.definitions.values()) {
      if (def.props.code === code) {
        return def;
      }
    }
    return null;
  }

  async save(aggregate: AchievementDefinitionAggregate): Promise<void> {
    this.definitions.set(aggregate.id.value, aggregate);
  }

  async delete(aggregate: AchievementDefinitionAggregate): Promise<void> {
    this.definitions.delete(aggregate.id.value);
  }
}

@Injectable()
export class InMemoryUserAchievementRepository implements UserAchievementRepository {
  private readonly userAchievements = new Map<string, UserAchievementAggregate>();

  async findById(id: UserAchievementId): Promise<UserAchievementAggregate | null> {
    return this.userAchievements.get(id.value) || null;
  }

  async listByUser(userId: string): Promise<readonly UserAchievementAggregate[]> {
    const result: UserAchievementAggregate[] = [];
    for (const achievement of this.userAchievements.values()) {
      if (achievement.props.userId === userId) {
        result.push(achievement);
      }
    }
    return result;
  }

  async save(aggregate: UserAchievementAggregate): Promise<void> {
    this.userAchievements.set(aggregate.id.value, aggregate);
  }

  async delete(aggregate: UserAchievementAggregate): Promise<void> {
    this.userAchievements.delete(aggregate.id.value);
  }
}
