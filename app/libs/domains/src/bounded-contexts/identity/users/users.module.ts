import { Module } from '@nestjs/common';
import { UsersDomainService } from './domain/users.service';
import { USER_REPOSITORY } from './domain/users.domain.entity';

@Module({
  providers: [
    UsersDomainService,
    { provide: USER_REPOSITORY, useValue: { findByEmail: async () => null, findById: async () => null, save: async () => {} } },
  ],
  exports: [UsersDomainService, USER_REPOSITORY],
})
export class UsersDomainModule {}
