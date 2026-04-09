import { Inject, Injectable } from '@nestjs/common';
import {
  USER_REPOSITORY,
  ChangeUserRoleCommand,
  LiftUserRestrictionCommand,
  RegisterUserCommand,
  UpdateUserProfileCommand,
  ApplyUserRestrictionCommand,
  UserAggregate,
} from './users.domain.entity';
import type {
  UserRepository,
  UserId,
} from './users.domain.entity';
import { UserAggregateImpl } from './user.aggregate';

@Injectable()
export class UsersDomainService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly repository: UserRepository,
  ) {}

  async register(command: RegisterUserCommand): Promise<UserAggregate> {
    // TODO: implement user registration logic
    throw new Error('UsersDomainService.register not implemented');
  }

  async updateProfile(
    command: UpdateUserProfileCommand,
  ): Promise<UserAggregate> {
    // TODO: implement profile update logic
    throw new Error('UsersDomainService.updateProfile not implemented');
  }

  async changeRole(command: ChangeUserRoleCommand): Promise<UserAggregate> {
    // TODO: implement role change logic
    throw new Error('UsersDomainService.changeRole not implemented');
  }

  async applyRestriction(
    command: ApplyUserRestrictionCommand,
  ): Promise<UserAggregate> {
    // TODO: implement restriction application logic
    throw new Error('UsersDomainService.applyRestriction not implemented');
  }

  async liftRestriction(
    command: LiftUserRestrictionCommand,
  ): Promise<UserAggregate> {
    // TODO: implement restriction removal logic
    throw new Error('UsersDomainService.liftRestriction not implemented');
  }

  async syncReputation(userId: string, delta: number): Promise<void> {
    const userIdentifier = { value: userId, brand: 'UserId' as const } as unknown as UserId;
    const user = await this.repository.findById(userIdentifier);
    if (user) {
        let aggregateImpl: UserAggregateImpl;
        if (user instanceof UserAggregateImpl) {
           aggregateImpl = user;
        } else {
           aggregateImpl = new UserAggregateImpl(user.id, user.props, user.createdAt, user.updatedAt, user.version);
        }
        aggregateImpl.updateReputation(delta);
        await this.repository.save(aggregateImpl);
    }
  }
}
