import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscussionsDomainService } from './domain/discussions.service';
import { Discussion } from './domain/discussion.entity';
import { Comment } from './domain/comment.entity';
import { PgDiscussionRepository } from './adapters/pg-discussion.repository';
import { DISCUSSION_REPOSITORY } from './domain/discussions.domain.entity';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    TypeOrmModule.forFeature([Discussion, Comment]),
    EventEmitterModule.forRoot(),
  ],
  providers: [
    DiscussionsDomainService,
    {
      provide: DISCUSSION_REPOSITORY,
      useClass: PgDiscussionRepository,
    },
  ],
  exports: [DiscussionsDomainService, DISCUSSION_REPOSITORY],
})
export class DiscussionsDomainModule {}
