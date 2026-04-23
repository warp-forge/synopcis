import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhenomenonEntity } from './phenomenon.entity';
import { PhenomenonDomainService } from './phenomenon.domain.service';
import { PhenomenonBlockEntity } from './phenomenon-block.entity';
import { PhenomenonAlternativeEntity } from './phenomenon-alternative.entity';
import { PhenomenonVoteEntity } from './phenomenon-vote.entity';
import { PhenomenonStorageService } from './phenomenon-storage.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ReputationDomainModule } from '../bounded-contexts/identity/reputation/reputation.module';

@Module({
  imports: [
    ReputationDomainModule,
    TypeOrmModule.forFeature([
      PhenomenonEntity,
      PhenomenonBlockEntity,
      PhenomenonAlternativeEntity,
      PhenomenonVoteEntity,
    ]),
    ClientsModule.register([
      {
        name: 'NATS_SERVICE',
        transport: Transport.NATS,
        options: {
          servers: [process.env.NATS_URL || 'nats://localhost:4222'],
        },
      },
    ]),
  ],
  providers: [PhenomenonDomainService, PhenomenonStorageService],
  exports: [PhenomenonDomainService, PhenomenonStorageService],
})
export class PhenomenonModule {}
