import { BaseAggregate } from '../../../../core';
import {
  AchievementDefinitionAggregate,
  AchievementDefinitionEvent,
  AchievementId,
  AchievementDefinitionProps,
} from './achievements.domain.entity';

export class AchievementDefinitionAggregateImpl
  extends BaseAggregate<AchievementId, AchievementDefinitionProps, AchievementDefinitionEvent>
  implements AchievementDefinitionAggregate
{
  protected apply(event: AchievementDefinitionEvent): void {
    // Basic apply if needed. Currently definition creation is enough.
  }
}
