import { Controller, Get, Post, Param, NotFoundException, BadRequestException } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TaskType, TaskMessage } from '@synop/shared-kernel';
import { WorkerAiService } from './worker-ai.service';

type AnalysisPayload = {
  articleSlug: string;
  sourceUrl: string;
};

type SuggestionsPayload = {
  phenomenonSlug: string;
  text: string;
};

@Controller()
export class WorkerAiController {
  constructor(private readonly workerAiService: WorkerAiService) {}

  @Get('health')
  health() {
    return this.workerAiService.status();
  }

  @Get('recent')
  recent() {
    return this.workerAiService.recentAnalyses();
  }

  @Get('analytics')
  getAnalytics() {
    return this.workerAiService.getAnalytics();
  }

  @Get('tasks/:id')
  getTask(@Param('id') id: string) {
    const task = this.workerAiService.getTask(id);
    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }
    return task;
  }

  @Post('tasks/:id/cancel')
  cancelTask(@Param('id') id: string) {
    const success = this.workerAiService.cancelTask(id);
    if (!success) {
      throw new BadRequestException(`Task with id ${id} could not be cancelled. It might not exist or is already completed/failed/cancelled.`);
    }
    return { status: 'cancelled', id };
  }

  @Post('tasks/:id/restart')
  async restartTask(@Param('id') id: string) {
    const result = await this.workerAiService.restartTask(id);
    if (!result) {
      throw new BadRequestException(`Task with id ${id} could not be restarted. It might not exist or is not in failed/cancelled state.`);
    }
    return result;
  }

  @MessagePattern(TaskType.ANALYZE_SOURCE)
  handleAnalyzeSource(@Payload() task: TaskMessage<AnalysisPayload>) {
    return this.workerAiService.analyzeSource(task);
  }

  @MessagePattern(TaskType.GET_AI_SUGGESTIONS)
  handleGetAiSuggestions(@Payload() task: TaskMessage<SuggestionsPayload>) {
    return this.workerAiService.getAiSuggestions(task);
  }
}
