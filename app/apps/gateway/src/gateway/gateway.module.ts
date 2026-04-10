import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { SharedKernelModule } from '@synop/shared-kernel';
import { AchievementsModule, PhenomenonModule } from '@synop/domains';
import { AuthModule } from '../auth/auth.module';
import { GitModule } from '../git/git.module';

@Module({
  imports: [
    SharedKernelModule,
    AchievementsModule,
    PhenomenonModule,
    AuthModule,
    GitModule,
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
