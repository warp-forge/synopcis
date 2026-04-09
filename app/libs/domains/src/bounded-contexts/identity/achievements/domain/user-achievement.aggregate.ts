import { BaseAggregate } from '../../../../core';
import {
  UserAchievementAggregate,
  UserAchievementEvent,
  UserAchievementId,
  UserAchievementProps,
} from './achievements.domain.entity';

export class UserAchievementAggregateImpl
  extends BaseAggregate<UserAchievementId, UserAchievementProps, UserAchievementEvent>
  implements UserAchievementAggregate
{
  protected apply(event: UserAchievementEvent): void {
    // Basic apply
  }
}
