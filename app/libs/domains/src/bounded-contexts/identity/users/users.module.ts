import { Module } from '@nestjs/common';
import { UsersDomainService } from './domain/users.service';
import { USER_REPOSITORY } from './domain/users.domain.entity';
import { InMemoryUserRepository } from './adapters/in-memory-user.repository';

@Module({
  providers: [
    UsersDomainService,
    { provide: USER_REPOSITORY, useClass: InMemoryUserRepository },
  ],
  exports: [UsersDomainService, USER_REPOSITORY],
})
export class UsersDomainModule {}
