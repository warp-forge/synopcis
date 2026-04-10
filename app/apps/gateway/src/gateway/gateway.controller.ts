import { Body, Controller, Get, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateAiAnalysisTaskDto } from '../dto/create-ai-analysis.dto';
import { CreateRenderTaskDto } from '../dto/create-render-task.dto';
import { CreateIngestionTaskDto } from '../dto/create-ingestion-task.dto';
import { GatewayService } from './gateway.service';

@Controller('tasks')
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
  }),
)
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Get('health')
  health() {
    return { status: 'ok' };
  }

  @Post('render')
  async enqueueRender(@Body() dto: CreateRenderTaskDto) {
    return this.gatewayService.scheduleRenderTask(dto);
  }

  @Post('analyze')
  async enqueueAnalysis(@Body() dto: CreateAiAnalysisTaskDto) {
    return this.gatewayService.scheduleAiAnalysis(dto);
  }

  @Post('ingest')
  async enqueueIngestion(@Body() dto: CreateIngestionTaskDto) {
    return this.gatewayService.scheduleIngestion(dto);
  }
}
