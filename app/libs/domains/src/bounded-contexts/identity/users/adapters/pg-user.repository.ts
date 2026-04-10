import { Injectable, OnModuleDestroy, Inject } from '@nestjs/common';
import { Pool, PoolConfig } from 'pg';
import { DatabaseConfigService } from '@synop/shared-kernel';
import { UserRepository, UserAggregate, UserId, UserRole, UserProps } from '../domain/users.domain.entity';
import { UserAggregateImpl } from '../domain/user.aggregate';

@Injectable()
export class PgUserRepository implements UserRepository, OnModuleDestroy {
  private readonly pool: Pool;

  constructor(private readonly config: DatabaseConfigService) {
    this.pool = new Pool(this.buildConfigFromEnv());
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

  async findById(id: UserId): Promise<UserAggregate | null> {
    const result = await this.pool.query(
      'SELECT id, display_name, email, role, reputation FROM users WHERE id = $1 LIMIT 1',
      [id.value],
    );

    if (result.rowCount === 0) {
      return null;
    }

    const row = result.rows[0];
    const props: UserProps = {
      email: row.email || '',
      role: row.role as UserRole || 'user',
      reputation: row.reputation || 0,
      profile: { displayName: row.display_name, languages: [] },
      settings: { notificationsEnabled: true, preferredLanguages: [], darkMode: false },
    };

    return new UserAggregateImpl(
      id,
      props,
      new Date(),
      new Date(),
      0
    );
  }

  async findByEmail(email: string): Promise<UserAggregate | null> {
    const result = await this.pool.query(
      'SELECT id, display_name, email, role, reputation FROM users WHERE email = $1 LIMIT 1',
      [email],
    );

    if (result.rowCount === 0) {
      return null;
    }

    const row = result.rows[0];
    const props: UserProps = {
      email: row.email || '',
      role: row.role as UserRole || 'user',
      reputation: row.reputation || 0,
      profile: { displayName: row.display_name, languages: [] },
      settings: { notificationsEnabled: true, preferredLanguages: [], darkMode: false },
    };

    return new UserAggregateImpl(
      { value: row.id, brand: 'UserId' } as UserId,
      props,
      new Date(),
      new Date(),
      0
    );
  }

  async save(aggregate: UserAggregate): Promise<void> {
    await this.pool.query(
      `UPDATE users
       SET display_name = $1, email = $2, role = $3, reputation = $4
       WHERE id = $5`,
      [
        aggregate.props.profile.displayName,
        aggregate.props.email,
        aggregate.props.role,
        aggregate.props.reputation,
        aggregate.id.value
      ]
    );
  }

  async delete(aggregate: UserAggregate): Promise<void> {
    await this.pool.query('DELETE FROM users WHERE id = $1', [aggregate.id.value]);
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
