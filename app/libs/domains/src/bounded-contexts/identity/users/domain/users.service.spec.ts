import { Test, TestingModule } from '@nestjs/testing';
import { UsersDomainService } from './users.service';
import { USER_REPOSITORY, UserId } from './users.domain.entity';
import { UserAggregateImpl } from './user.aggregate';

describe('UsersDomainService', () => {
  let service: UsersDomainService;
  let repository: any;

  beforeEach(async () => {
    repository = {
      findById: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersDomainService,
        { provide: USER_REPOSITORY, useValue: repository },
      ],
    }).compile();

    service = module.get<UsersDomainService>(UsersDomainService);
  });

  it('should apply restriction when karma drops below zero', async () => {
    const user = new UserAggregateImpl(
      { value: 'user-1', brand: 'UserId' } as unknown as UserId,
      { email: 'test@example.com', role: 'user', profile: { displayName: 'test', languages: [] }, settings: { notificationsEnabled: true, preferredLanguages: [], darkMode: false }, reputation: 5 },
      new Date(),
      new Date(),
      0
    );
    repository.findById.mockResolvedValue(user);

    await service.syncReputation('user-1', -10); // Reputation becomes -5

    expect(repository.save).toHaveBeenCalled();
    const savedUser = repository.save.mock.calls[0][0] as UserAggregateImpl;
    expect(savedUser.props.reputation).toBe(-5);
    expect(savedUser.props.restrictions).toBeDefined();
    expect(savedUser.props.restrictions?.reason).toBe('Negative Karma Restriction');
  });

  it('should lift restriction when karma becomes positive', async () => {
    const user = new UserAggregateImpl(
      { value: 'user-1', brand: 'UserId' } as unknown as UserId,
      {
        email: 'test@example.com',
        role: 'user',
        profile: { displayName: 'test', languages: [] },
        settings: { notificationsEnabled: true, preferredLanguages: [], darkMode: false },
        reputation: -5,
        restrictions: { reason: 'Negative Karma Restriction', until: new Date(), imposedBy: 'system' }
      },
      new Date(),
      new Date(),
      0
    );
    repository.findById.mockResolvedValue(user);

    await service.syncReputation('user-1', 10); // Reputation becomes 5

    expect(repository.save).toHaveBeenCalled();
    const savedUser = repository.save.mock.calls[0][0] as UserAggregateImpl;
    expect(savedUser.props.reputation).toBe(5);
    expect(savedUser.props.restrictions).toBeUndefined();
  });
});
