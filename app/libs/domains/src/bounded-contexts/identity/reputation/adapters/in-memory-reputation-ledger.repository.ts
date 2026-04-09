import { Injectable } from '@nestjs/common';
import { ReputationLedgerRepository, ReputationLedgerAggregate, ReputationLedgerId } from '../domain/reputation.domain.entity';

@Injectable()
export class InMemoryReputationLedgerRepository implements ReputationLedgerRepository {
  private readonly ledgers = new Map<string, ReputationLedgerAggregate>();

  async findById(id: ReputationLedgerId): Promise<ReputationLedgerAggregate | null> {
    return this.ledgers.get(id.value) || null;
  }

  async findByUserId(userId: string): Promise<ReputationLedgerAggregate | null> {
    for (const ledger of this.ledgers.values()) {
      if (ledger.props.userId === userId) {
        return ledger;
      }
    }
    return null;
  }

  async save(aggregate: ReputationLedgerAggregate): Promise<void> {
    this.ledgers.set(aggregate.id.value, aggregate);
  }

  async delete(aggregate: ReputationLedgerAggregate): Promise<void> {
    this.ledgers.delete(aggregate.id.value);
  }
}
