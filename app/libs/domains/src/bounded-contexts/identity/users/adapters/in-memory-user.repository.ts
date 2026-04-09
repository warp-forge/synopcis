import { Injectable } from '@nestjs/common';
import { UserRepository, UserAggregate, UserId } from '../domain/users.domain.entity';

@Injectable()
export class InMemoryUserRepository implements UserRepository {
  private readonly users = new Map<string, UserAggregate>();

  async findById(id: UserId): Promise<UserAggregate | null> {
    return this.users.get(id.value) || null;
  }

  async findByEmail(email: string): Promise<UserAggregate | null> {
    for (const user of this.users.values()) {
      if (user.props.email === email) {
        return user;
      }
    }
    return null;
  }

  async save(aggregate: UserAggregate): Promise<void> {
    this.users.set(aggregate.id.value, aggregate);
  }

  async delete(aggregate: UserAggregate): Promise<void> {
    this.users.delete(aggregate.id.value);
  }
}
