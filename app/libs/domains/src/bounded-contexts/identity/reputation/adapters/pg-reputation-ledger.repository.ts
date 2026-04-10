import { Injectable, OnModuleDestroy, Inject } from '@nestjs/common';
import { Pool, PoolConfig } from 'pg';
import { DatabaseConfigService } from '@synop/shared-kernel';
import { ReputationLedgerRepository, ReputationLedgerAggregate, ReputationLedgerId, ReputationLedgerProps, ReputationEntry } from '../domain/reputation.domain.entity';
import { ReputationLedgerAggregateImpl } from '../domain/reputation-ledger.aggregate';

@Injectable()
export class PgReputationLedgerRepository implements ReputationLedgerRepository, OnModuleDestroy {
  private readonly pool: Pool;

  constructor(private readonly config: DatabaseConfigService) {
    this.pool = new Pool(this.buildConfigFromEnv());
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

  async findById(id: ReputationLedgerId): Promise<ReputationLedgerAggregate | null> {
    return this.fetchLedger('id', id.value);
  }

  async findByUserId(userId: string): Promise<ReputationLedgerAggregate | null> {
    return this.fetchLedger('user_id', userId);
  }

  private async fetchLedger(column: string, value: string): Promise<ReputationLedgerAggregate | null> {
    const result = await this.pool.query(
      `SELECT id, user_id, total, history FROM reputation_ledgers WHERE ${column} = $1 LIMIT 1`,
      [value],
    );

    if (result.rowCount === 0) {
      return null;
    }

    const row = result.rows[0];
    const props: ReputationLedgerProps = {
      userId: row.user_id,
      total: row.total || 0,
      history: row.history ? (JSON.parse(row.history) as ReputationEntry[]) : [],
    };

    return new ReputationLedgerAggregateImpl(
      { value: row.id, brand: 'ReputationLedger' } as ReputationLedgerId,
      props,
      new Date(),
      new Date(),
      0
    );
  }

  async save(aggregate: ReputationLedgerAggregate): Promise<void> {
    await this.pool.query(
      `INSERT INTO reputation_ledgers (id, user_id, total, history)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE
       SET total = EXCLUDED.total, history = EXCLUDED.history`,
      [
        aggregate.id.value,
        aggregate.props.userId,
        aggregate.props.total,
        JSON.stringify(aggregate.props.history),
      ]
    );
  }

  async delete(aggregate: ReputationLedgerAggregate): Promise<void> {
    await this.pool.query('DELETE FROM reputation_ledgers WHERE id = $1', [aggregate.id.value]);
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
