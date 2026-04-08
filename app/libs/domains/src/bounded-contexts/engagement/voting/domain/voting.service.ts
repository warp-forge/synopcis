import { Inject, Injectable } from '@nestjs/common';
import {
  VOTE_REPOSITORY,
  VoteAggregate,
  CastVoteCommand,
  RetractVoteCommand,
} from './voting.domain.entity';
import type {
  VoteRepository,
} from './voting.domain.entity';

@Injectable()
export class VotingDomainService {
  constructor(
    @Inject(VOTE_REPOSITORY)
    private readonly repository: VoteRepository,
  ) {}

  async cast(command: CastVoteCommand): Promise<VoteAggregate> {
    // TODO: implement vote casting logic
    throw new Error('VotingDomainService.cast not implemented');
  }

  async retract(command: RetractVoteCommand): Promise<VoteAggregate> {
    // TODO: implement vote retraction logic
    throw new Error('VotingDomainService.retract not implemented');
  }
}
