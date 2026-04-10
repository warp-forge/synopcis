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
} from './users.domain.entity';

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
}
