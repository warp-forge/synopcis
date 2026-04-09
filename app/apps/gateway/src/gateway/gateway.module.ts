import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { SharedKernelModule } from '@synop/shared-kernel';
import { AchievementsModule, PhenomenonModule } from '@synop/domains';
import { AuthModule } from '../auth/auth.module';
import { ManifestModule } from '../manifest/manifest.module';

@Module({
  imports: [
    SharedKernelModule,
    AchievementsModule,
    PhenomenonModule,
    AuthModule,
    ManifestModule,
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
  controllers: [GatewayController],
  providers: [GatewayService],
})
export class GatewayModule {}
