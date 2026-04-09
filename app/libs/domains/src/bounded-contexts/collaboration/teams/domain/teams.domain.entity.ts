import {
  AggregateRoot,
  DomainEvent,
  Identifier,
  Ownership,
  RepositoryPort,
  UUID,
  UseCase,
  Command,
} from '../../../../core';

export type TeamId = Identifier;

export interface TeamMember {
  readonly userId: UUID;
  readonly role: TeamRole;
  readonly joinedAt: Date;
}

export type TeamRole = 'owner' | 'editor' | 'viewer' | 'moderator';

export interface TeamProps {
  readonly name: string;
  readonly description?: string;
  readonly isPrivate: boolean;
  readonly members: readonly TeamMember[];
  readonly ownership: Ownership;
}

export interface TeamAggregate extends AggregateRoot<TeamId, TeamProps, TeamEvent> {}

export type TeamEvent =
  | TeamCreatedEvent
  | TeamMemberInvitedEvent
  | TeamMemberRemovedEvent
  | TeamRoleChangedEvent;

export interface TeamCreatedEvent extends DomainEvent<{ readonly name: string }> {}

export interface TeamMemberInvitedEvent extends DomainEvent<{ readonly userId: UUID; readonly role: TeamRole }> {}

export interface TeamMemberRemovedEvent extends DomainEvent<{ readonly userId: UUID }> {}

export interface TeamRoleChangedEvent
  extends DomainEvent<{ readonly userId: UUID; readonly role: TeamRole }> {}

export interface TeamRepository extends RepositoryPort<TeamAggregate, TeamId> {
  listByMember(userId: UUID): Promise<readonly TeamAggregate[]>;
}

export const TEAM_REPOSITORY = Symbol('TEAM_REPOSITORY');

export interface CreateTeamCommand {
  readonly name: string;
  readonly description?: string;
  readonly ownerId: UUID;
  readonly isPrivate: boolean;
}

export interface InviteTeamMemberCommand {
  readonly teamId: TeamId;
  readonly invitedUserId: UUID;
  readonly role: TeamRole;
  readonly invitedBy: UUID;
}

export interface RemoveTeamMemberCommand {
  readonly teamId: TeamId;
  readonly userId: UUID;
  readonly removedBy: UUID;
}

export interface ChangeTeamRoleCommand {
  readonly teamId: TeamId;
  readonly userId: UUID;
  readonly role: TeamRole;
  readonly changedBy: UUID;
}

export type TeamUseCase<TCommand extends Command<unknown>, TResult> = UseCase<TCommand, TResult>;
