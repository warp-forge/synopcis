import { Module } from '@nestjs/common';
import { DiscussionsController } from './discussions.controller';
import { DiscussionsDomainModule } from '@synop/domains';

@Module({
  imports: [DiscussionsDomainModule],
  controllers: [DiscussionsController],
})
export class DiscussionsModule {}
