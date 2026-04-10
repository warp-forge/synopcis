import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool, PoolConfig } from 'pg';
import { DatabaseConfigService } from './database-config';
import { UserAccount, UsersRepository } from './users.repository';

@Injectable()
export class PgUsersRepository implements UsersRepository, OnModuleDestroy {
  private readonly pool: Pool;

  constructor(private readonly config: DatabaseConfigService) {
    this.pool = new Pool(this.buildConfigFromEnv());
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

  async findById(id: string): Promise<UserAccount | null> {
    const result = await this.pool.query<{ id: string; display_name: string; email?: string | null }>(
      'SELECT id, display_name, email FROM users WHERE id = $1 LIMIT 1',
      [id],
    );

    if (result.rowCount === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      displayName: row.display_name ?? row.id,
      email: row.email ?? null,
    };
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
