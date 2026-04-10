import { Injectable, OnModuleDestroy, Inject } from '@nestjs/common';
import { Pool, PoolConfig } from 'pg';
import { DatabaseConfigService } from '@synop/shared-kernel';
import {
  AchievementDefinitionRepository,
  UserAchievementRepository,
  AchievementDefinitionAggregate,
  UserAchievementAggregate,
  AchievementId,
  UserAchievementId,
  AchievementDefinitionProps,
  UserAchievementProps,
} from '../domain/achievements.domain.entity';
import { AchievementDefinitionAggregateImpl } from '../domain/achievement-definition.aggregate';
import { UserAchievementAggregateImpl } from '../domain/user-achievement.aggregate';

@Injectable()
export class PgAchievementDefinitionRepository implements AchievementDefinitionRepository, OnModuleDestroy {
  private readonly pool: Pool;

  constructor(private readonly config: DatabaseConfigService) {
    this.pool = new Pool(this.buildConfigFromEnv());
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

  async findById(id: AchievementId): Promise<AchievementDefinitionAggregate | null> {
    return this.fetchDefinition('id', id.value);
  }

  async findByCode(code: string): Promise<AchievementDefinitionAggregate | null> {
    return this.fetchDefinition('code', code);
  }

  private async fetchDefinition(column: string, value: string): Promise<AchievementDefinitionAggregate | null> {
    const result = await this.pool.query(
      `SELECT id, code, title, description, icon, criteria, is_secret FROM achievement_definitions WHERE ${column} = $1 LIMIT 1`,
      [value],
    );

    if (result.rowCount === 0) {
      return null;
    }

    const row = result.rows[0];
    const props: AchievementDefinitionProps = {
      code: row.code,
      title: row.title,
      description: row.description,
      icon: row.icon,
      criteria: row.criteria ? JSON.parse(row.criteria) : [],
      isSecret: row.is_secret,
    };

    return new AchievementDefinitionAggregateImpl(
      { value: row.id, brand: 'Achievement' } as AchievementId,
      props,
      new Date(),
      new Date(),
      0
    );
  }

  async save(aggregate: AchievementDefinitionAggregate): Promise<void> {
    await this.pool.query(
      `INSERT INTO achievement_definitions (id, code, title, description, icon, criteria, is_secret)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE
       SET code = EXCLUDED.code, title = EXCLUDED.title, description = EXCLUDED.description,
           icon = EXCLUDED.icon, criteria = EXCLUDED.criteria, is_secret = EXCLUDED.is_secret`,
      [
        aggregate.id.value,
        aggregate.props.code,
        aggregate.props.title,
        aggregate.props.description,
        aggregate.props.icon,
        JSON.stringify(aggregate.props.criteria),
        aggregate.props.isSecret,
      ]
    );
  }

  async delete(aggregate: AchievementDefinitionAggregate): Promise<void> {
    await this.pool.query('DELETE FROM achievement_definitions WHERE id = $1', [aggregate.id.value]);
  }

  private buildConfigFromEnv(): PoolConfig {
    const base = this.config.getConfigFromEnv('DB');
    return {
      host: base.host,
      port: base.port,
      user: base.user,
      password: base.password,
      database: base.database,
      max: 5,
    };
  }
}

@Injectable()
export class PgUserAchievementRepository implements UserAchievementRepository, OnModuleDestroy {
  private readonly pool: Pool;

  constructor(private readonly config: DatabaseConfigService) {
    this.pool = new Pool(this.buildConfigFromEnv());
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

  async findById(id: UserAchievementId): Promise<UserAchievementAggregate | null> {
    const result = await this.pool.query(
      'SELECT id, user_id, achievement_id, unlocked_at, evidence FROM user_achievements WHERE id = $1 LIMIT 1',
      [id.value],
    );

    if (result.rowCount === 0) {
      return null;
    }

    const row = result.rows[0];
    const props: UserAchievementProps = {
      userId: row.user_id,
      achievementId: { value: row.achievement_id, brand: 'Achievement' } as AchievementId,
      unlockedAt: row.unlocked_at,
      evidence: row.evidence ? JSON.parse(row.evidence) : {},
    };

    return new UserAchievementAggregateImpl(
      id,
      props,
      new Date(),
      new Date(),
      0
    );
  }

  async listByUser(userId: string): Promise<readonly UserAchievementAggregate[]> {
    const result = await this.pool.query(
      'SELECT id, user_id, achievement_id, unlocked_at, evidence FROM user_achievements WHERE user_id = $1',
      [userId],
    );

    return result.rows.map(row => {
      const props: UserAchievementProps = {
        userId: row.user_id,
        achievementId: { value: row.achievement_id, brand: 'Achievement' } as AchievementId,
        unlockedAt: row.unlocked_at,
        evidence: row.evidence ? JSON.parse(row.evidence) : {},
      };

      return new UserAchievementAggregateImpl(
        { value: row.id, brand: 'UserAchievement' } as UserAchievementId,
        props,
        new Date(),
        new Date(),
        0
      );
    });
  }

  async save(aggregate: UserAchievementAggregate): Promise<void> {
    await this.pool.query(
      `INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at, evidence)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE
       SET unlocked_at = EXCLUDED.unlocked_at, evidence = EXCLUDED.evidence`,
      [
        aggregate.id.value,
        aggregate.props.userId,
        aggregate.props.achievementId.value,
        aggregate.props.unlockedAt,
        JSON.stringify(aggregate.props.evidence),
      ]
    );
  }

  async delete(aggregate: UserAchievementAggregate): Promise<void> {
    await this.pool.query('DELETE FROM user_achievements WHERE id = $1', [aggregate.id.value]);
  }

  private buildConfigFromEnv(): PoolConfig {
    const base = this.config.getConfigFromEnv('DB');
    return {
      host: base.host,
      port: base.port,
      user: base.user,
      password: base.password,
      database: base.database,
      max: 5,
    };
  }
}
