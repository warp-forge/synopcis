import { Test, TestingModule } from '@nestjs/testing';
import { AchievementsDomainService } from './achievements.service';
import {
  ACHIEVEMENT_DEFINITION_REPOSITORY,
  USER_ACHIEVEMENT_REPOSITORY,
} from './achievements.domain.entity';

describe('AchievementsDomainService', () => {
  let service: AchievementsDomainService;
  let definitionsRepo: any;
  let userAchievementsRepo: any;

  beforeEach(async () => {
    definitionsRepo = {
      findByCode: jest.fn(),
      save: jest.fn(),
    };
    userAchievementsRepo = {
      listByUser: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AchievementsDomainService,
        { provide: ACHIEVEMENT_DEFINITION_REPOSITORY, useValue: definitionsRepo },
        { provide: USER_ACHIEVEMENT_REPOSITORY, useValue: userAchievementsRepo },
      ],
    }).compile();

    service = module.get<AchievementsDomainService>(AchievementsDomainService);
  });

  it('should automatically evaluate and grant an achievement', async () => {
    // Setup initial conditions
    userAchievementsRepo.listByUser.mockResolvedValue([]);
    definitionsRepo.findByCode.mockResolvedValue({
      id: { value: 'achievement-1' },
    });

    const metrics = { 'articles.created': 15 };
    const unlocked = await service.evaluate({ userId: 'user-1', metricSnapshots: metrics });

    expect(definitionsRepo.findByCode).toHaveBeenCalledWith('prolific-author');
    expect(userAchievementsRepo.save).toHaveBeenCalled();
    expect(unlocked.length).toBe(1);
    expect(unlocked[0].props.achievementId.value).toBe('achievement-1');
  });

  it('should skip already unlocked achievements', async () => {
    // Setup to return an existing achievement
    userAchievementsRepo.listByUser.mockResolvedValue([{
      props: { achievementId: { value: 'achievement-1' } }
    }]);
    definitionsRepo.findByCode.mockResolvedValue({
      id: { value: 'achievement-1' },
    });

    const metrics = { 'articles.created': 15 };
    const unlocked = await service.evaluate({ userId: 'user-1', metricSnapshots: metrics });

    expect(definitionsRepo.findByCode).toHaveBeenCalledWith('prolific-author');
    expect(userAchievementsRepo.save).not.toHaveBeenCalled();
    expect(unlocked.length).toBe(0);
  });
});
