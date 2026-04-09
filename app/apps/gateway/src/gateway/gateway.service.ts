import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateAiAnalysisTaskDto } from '../dto/create-ai-analysis.dto';
import { CreateRenderTaskDto } from '../dto/create-render-task.dto';
import { CreateIngestionTaskDto } from '../dto/create-ingestion-task.dto';
import { CreateAiDraftTaskDto } from '../dto/create-ai-draft-task.dto';
import { TaskType, createTaskMessage } from '@synop/shared-kernel';
import { ScheduleAiSuggestionsDto } from '../dto/schedule-ai-suggestions.dto';

@Injectable()
export class GatewayService {
  constructor(@Inject('NATS_SERVICE') private readonly client: ClientProxy) {}

  async scheduleRenderTask(dto: CreateRenderTaskDto) {
    return this.client.send(
      TaskType.RENDER_STATIC,
      createTaskMessage({
        type: TaskType.RENDER_STATIC,
        payload: dto,
        source: dto.source,
      }),
    );
  }

  async scheduleAiAnalysis(dto: CreateAiAnalysisTaskDto) {
    return this.client.send(
      TaskType.ANALYZE_SOURCE,
      createTaskMessage({
        type: TaskType.ANALYZE_SOURCE,
        payload: dto,
        correlationId: dto.articleSlug,
        source: dto.sourceUrl,
      }),
    );
  }

  async scheduleIngestion(dto: CreateIngestionTaskDto) {
    return this.client.send(
      TaskType.INGEST_WIKIPEDIA,
      createTaskMessage({
        type: TaskType.INGEST_WIKIPEDIA,
        payload: dto,
        correlationId: dto.articleName,
        source: 'wikipedia',
      }),
    );
  }

  async scheduleAiDraft(dto: CreateAiDraftTaskDto) {
    return this.client.send(
      TaskType.AI_DRAFT,
      createTaskMessage({
        type: TaskType.AI_DRAFT,
        payload: dto,
        correlationId: dto.phenomenonSlug,
        source: 'wikipedia',
      }),
    );
  }

  async scheduleAiSuggestions(dto: ScheduleAiSuggestionsDto) {
    return this.client.send(
      TaskType.GET_AI_SUGGESTIONS,
      createTaskMessage({
        type: TaskType.GET_AI_SUGGESTIONS,
        payload: dto,
        correlationId: dto.phenomenonSlug,
        source: 'user-input',
      }),
    );
  }
}
