import { Module } from '@nestjs/common';
import { ManifestController } from './manifest.controller';
import { PhenomenonModule } from '@synop/domains';

@Module({
  imports: [PhenomenonModule],
  controllers: [ManifestController],
})
export class ManifestModule {}
