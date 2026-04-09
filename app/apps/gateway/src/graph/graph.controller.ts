import { Controller, Get, Query } from '@nestjs/common';
import { GraphService } from './graph.service';

@Controller('api/graph')
export class GraphController {
  constructor(private readonly graphService: GraphService) {}

  @Get()
  async getGraph(@Query('article') articleSlug: string) {
    if (!articleSlug) {
      return { nodes: [], links: [] };
    }
    return this.graphService.getGraphData(articleSlug);
  }
}
