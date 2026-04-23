import { Inject, Injectable } from '@nestjs/common';
import {
  DUEL_REPOSITORY,
  DuelAggregate,
  StartDuelCommand,
  RegisterDuelVoteCommand,
  CancelDuelCommand,
} from './duels.domain.entity';
import type { DuelRepository } from './duels.domain.entity';

@Injectable()
export class DuelsDomainService {
  constructor(
    @Inject(DUEL_REPOSITORY)
    private readonly repository: DuelRepository,
  ) {}

  async start(command: StartDuelCommand): Promise<DuelAggregate> {
    // TODO: implement duel start logic
    throw new Error('DuelsDomainService.start not implemented');
  }

  async registerVote(command: RegisterDuelVoteCommand): Promise<DuelAggregate> {
    // TODO: implement duel voting logic
    throw new Error('DuelsDomainService.registerVote not implemented');
  }

  async cancel(command: CancelDuelCommand): Promise<DuelAggregate> {
    // TODO: implement duel cancellation logic
    throw new Error('DuelsDomainService.cancel not implemented');
  }
}
