import { Inject, Injectable } from '@nestjs/common';
import {
  TEAM_REPOSITORY,
  TeamAggregate,
  ChangeTeamRoleCommand,
  CreateTeamCommand,
  InviteTeamMemberCommand,
  RemoveTeamMemberCommand,
} from './teams.domain.entity';
import type {
  TeamRepository,
} from './teams.domain.entity';

@Injectable()
export class TeamsDomainService {
  constructor(
    @Inject(TEAM_REPOSITORY)
    private readonly repository: TeamRepository,
  ) {}

  async create(command: CreateTeamCommand): Promise<TeamAggregate> {
    // TODO: implement team creation logic
    throw new Error('TeamsDomainService.create not implemented');
  }

  async invite(command: InviteTeamMemberCommand): Promise<TeamAggregate> {
    // TODO: implement member invitation logic
    throw new Error('TeamsDomainService.invite not implemented');
  }

  async remove(command: RemoveTeamMemberCommand): Promise<TeamAggregate> {
    // TODO: implement member removal logic
    throw new Error('TeamsDomainService.remove not implemented');
  }

  async changeRole(command: ChangeTeamRoleCommand): Promise<TeamAggregate> {
    // TODO: implement role change logic
    throw new Error('TeamsDomainService.changeRole not implemented');
  }
}
