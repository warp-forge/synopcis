import {
  AggregateRoot,
  DomainEvent,
  Identifier,
  RepositoryPort,
  UUID,
  UseCase,
  ValueObject,
  Command,
} from '../../../../core';

export type UserId = Identifier;

export type UserRole = 'user' | 'moderator' | 'admin';

export interface UserProfile extends ValueObject<{ readonly displayName: string }> {
  readonly bio?: string;
  readonly avatarUrl?: string;
  readonly location?: string;
  readonly languages: readonly string[];
}

export interface UserSettings extends ValueObject<Record<string, unknown>> {
  readonly notificationsEnabled: boolean;
  readonly preferredLanguages: readonly string[];
  readonly darkMode: boolean;
}

export interface UserProps {
  readonly email: string;
  readonly role: UserRole;
  readonly profile: UserProfile;
  readonly settings: UserSettings;
  readonly reputation: number;
  readonly restrictions?: UserRestriction;
}

export interface UserRestriction {
  readonly reason: string;
  readonly until: Date;
  readonly imposedBy: UUID;
}

export interface UserAggregate extends AggregateRoot<UserId, UserProps, UserEvent> {}

export type UserEvent =
  | UserRegisteredEvent
  | UserProfileUpdatedEvent
  | UserRoleChangedEvent
  | UserRestrictionAppliedEvent
  | UserRestrictionLiftedEvent;

export interface UserRegisteredEvent extends DomainEvent<{ readonly email: string }> {}

export interface UserProfileUpdatedEvent extends DomainEvent<{ readonly profile: UserProfile }> {}

export interface UserRoleChangedEvent extends DomainEvent<{ readonly role: UserRole }> {}

export interface UserRestrictionAppliedEvent
  extends DomainEvent<{ readonly restriction: UserRestriction }> {}

export interface UserRestrictionLiftedEvent extends DomainEvent<{ readonly restrictionId: UUID }> {}

export interface UserRepository extends RepositoryPort<UserAggregate, UserId> {
  findByEmail(email: string): Promise<UserAggregate | null>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface RegisterUserCommand {
  readonly email: string;
  readonly displayName: string;
  readonly languages?: readonly string[];
}

export interface UpdateUserProfileCommand {
  readonly userId: UserId;
  readonly profile: Partial<UserProfile>;
}

export interface ChangeUserRoleCommand {
  readonly userId: UserId;
  readonly role: UserRole;
  readonly performedBy: UUID;
}

export interface ApplyUserRestrictionCommand {
  readonly userId: UserId;
  readonly reason: string;
  readonly until: Date;
  readonly performedBy: UUID;
}

export interface LiftUserRestrictionCommand {
  readonly userId: UserId;
  readonly performedBy: UUID;
}

export type UserUseCase<TCommand extends Command<unknown>, TResult> = UseCase<TCommand, TResult>;
