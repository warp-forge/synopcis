import { Module } from '@nestjs/common';
import { GraphController } from './graph.controller';
import { GraphService } from './graph.service';
import { PhenomenonModule } from '@synop/domains';

@Module({
  imports: [PhenomenonModule],
  controllers: [GraphController],
  providers: [GraphService],
})
export class GraphModule {}
