import { Injectable, Inject, Optional } from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepository,
  UserId,
} from '@synop/domains/bounded-contexts/identity/users/domain/users.domain.entity';
import {
  REPUTATION_LEDGER_REPOSITORY,
  ReputationLedgerRepository,
} from '@synop/domains/bounded-contexts/identity/reputation/domain/reputation.domain.entity';
import {
  USER_ACHIEVEMENT_REPOSITORY,
  UserAchievementRepository,
} from '@synop/domains/bounded-contexts/identity/achievements/domain/achievements.domain.entity';

@Injectable()
export class ProfileService {
  constructor(
    @Optional() @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Optional() @Inject(REPUTATION_LEDGER_REPOSITORY)
    private readonly reputationRepository: ReputationLedgerRepository,
    @Optional() @Inject(USER_ACHIEVEMENT_REPOSITORY)
    private readonly userAchievementRepository: UserAchievementRepository,
  ) {}

  async getProfile(userId: string) {
    if (!this.userRepository) {
      throw new Error('USER_REPOSITORY not available');
    }

    // Use proper identifier interface (we define it to match UserId port)
    const userIdentifier: UserId = { value: userId, brand: 'UserId' as const } as unknown as UserId;
    const user = await this.userRepository.findById(userIdentifier);

    if (!user) {
      return null;
    }

    let karma = 0;
    let history = [];
    if (this.reputationRepository) {
      const ledger = await this.reputationRepository.findByUserId(userId);
      if (ledger) {
        karma = ledger.props.total;
        history = [...ledger.props.history];
      }
    }

    let achievements = [];
    if (this.userAchievementRepository) {
      const userAchievements = await this.userAchievementRepository.listByUser(userId);
      achievements = userAchievements.map((ua) => ua.props);
    }

    return {
      id: user.id.value,
      profile: user.props.profile,
      role: user.props.role,
      karma,
      achievements,
      activityHistory: history.slice(-50),
    };
  }
}
