import { Controller, Get } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TaskType } from '@synop/shared-kernel';
import type { TaskMessage } from '@synop/shared-kernel';
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

  @MessagePattern(TaskType.ANALYZE_SOURCE)
  handleAnalyzeSource(@Payload() task: TaskMessage<AnalysisPayload>) {
    return this.workerAiService.analyzeSource(task);
  }

  @MessagePattern(TaskType.GET_AI_SUGGESTIONS)
  handleGetAiSuggestions(@Payload() task: TaskMessage<SuggestionsPayload>) {
    return this.workerAiService.getAiSuggestions(task);
  }

  @MessagePattern(TaskType.AI_EMBEDDING)
  async handleEmbedding(@Payload() task: TaskMessage<{ text: string }>) {
    return this.workerAiService.runEmbedding(task.payload);
  }

  @MessagePattern(TaskType.AI_NER)
  async handleNer(@Payload() task: TaskMessage<{ text: string }>) {
    return this.workerAiService.runNer(task.payload);
  }

  @MessagePattern(TaskType.AI_VERIFY_SOURCE)
  async handleVerifySource(@Payload() task: TaskMessage<{ url: string }>) {
    return this.workerAiService.runVerifySource(task.payload);
  }

  @MessagePattern(TaskType.AI_TRANSLATE)
  async handleTranslate(
    @Payload() task: TaskMessage<{ text: string; targetLang: string }>,
  ) {
    return this.workerAiService.runTranslation(task.payload);
  }

  @MessagePattern(TaskType.AI_GENERATE_BLOCKS)
  async handleGenerateBlocks(
    @Payload() task: TaskMessage<{ content: string }>,
  ) {
    return this.workerAiService.runGenerateBlocks(task.payload);
  }

  @MessagePattern(TaskType.AI_SYNTHESIZE)
  async handleSynthesize(
    @Payload()
    task: TaskMessage<{ articles: { lang: string; content: string }[] }>,
  ) {
    return this.workerAiService.runSynthesize(task.payload);
  }
}
