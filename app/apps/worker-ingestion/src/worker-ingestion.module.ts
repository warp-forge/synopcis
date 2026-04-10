import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  ArticlesDomainModule,
  PhenomenonModule,
} from '@synop/domains';
import { WorkerIngestionController } from './worker-ingestion.controller';
import { WorkerIngestionService } from './worker-ingestion.service';
import { WikipediaService } from './wikipedia/wikipedia.service';
import { StorageService } from './storage/storage.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'NATS_SERVICE',
        transport: Transport.NATS,
        options: {
          servers: [process.env.NATS_URL || 'nats://localhost:4222'],
        },
      },
    ]),
    ArticlesDomainModule,
    PhenomenonModule,
  ],
  controllers: [WorkerIngestionController],
  providers: [WorkerIngestionService, WikipediaService, StorageService],
})
export class WorkerIngestionModule {}
