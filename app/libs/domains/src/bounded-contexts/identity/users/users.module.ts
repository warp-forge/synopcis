import { Module } from '@nestjs/common';
import { SharedKernelModule } from '@synop/shared-kernel';
import { UsersDomainService } from './domain/users.service';
import { USER_REPOSITORY } from './domain/users.domain.entity';
import { PgUserRepository } from './adapters/pg-user.repository';

@Module({
  imports: [SharedKernelModule],
  providers: [
    UsersDomainService,
    { provide: USER_REPOSITORY, useClass: PgUserRepository },
  ],
  exports: [UsersDomainService, USER_REPOSITORY],
})
export class UsersDomainModule {}
