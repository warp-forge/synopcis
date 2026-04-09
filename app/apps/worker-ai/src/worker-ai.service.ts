import { Injectable } from '@nestjs/common';
import { MarkdownRenderer, TaskMessage } from '@synop/shared-kernel';
import { randomUUID } from 'crypto';

import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiTaskRecordEntity } from './entities/ai-task.entity';

type AnalysisPayload = {
  articleSlug: string;
  sourceUrl: string;
};

export type AiTaskRecord = {
  id: string;
  type: string;
  status: string;
  result?: any;
  error?: string;
  completedAt: Date;
};

type SuggestionsPayload = {
  phenomenonSlug: string;
  text: string;
};

@Injectable()
export class WorkerAiService {
  constructor(
    private readonly renderer: MarkdownRenderer,
    @InjectRepository(AiTaskRecordEntity)
    private readonly aiTaskRepo: Repository<AiTaskRecordEntity>,
    @InjectQueue('ai-embedding') private embeddingQueue: Queue,
    @InjectQueue('ai-ner') private nerQueue: Queue,
    @InjectQueue('ai-verify-source') private verifySourceQueue: Queue,
    @InjectQueue('ai-translation') private translationQueue: Queue,
    @InjectQueue('ai-analysis') private analysisQueue: Queue,
    @InjectQueue('ai-suggestions') private suggestionsQueue: Queue,
  ) {}

  async saveTaskResult(record: AiTaskRecord) {
    let entity = await this.aiTaskRepo.findOne({ where: { id: record.id } });
    if (!entity) {
      entity = this.aiTaskRepo.create({
        id: record.id,
      });
    }
    entity.type = record.type;
    entity.status = record.status;
    entity.result = record.result;
    entity.error = record.error;
    await this.aiTaskRepo.save(entity);
  }

  async getQueueStatus() {
    const queues = [
      this.embeddingQueue,
      this.nerQueue,
      this.verifySourceQueue,
      this.translationQueue,
      this.analysisQueue,
      this.suggestionsQueue,
    ];

    let waiting = 0,
      active = 0,
      completed = 0,
      failed = 0;

    for (const queue of queues) {
      const [qWaiting, qActive, qCompleted, qFailed] = await Promise.all([
        queue.getWaitingCount(),
        queue.getActiveCount(),
        queue.getCompletedCount(),
        queue.getFailedCount(),
      ]);
      waiting += qWaiting;
      active += qActive;
      completed += qCompleted;
      failed += qFailed;
    }

    return { waiting, active, completed, failed };
  }

  async retryJob(queueName: string, jobId: string) {
    const queues: Record<string, Queue> = {
      'ai-embedding': this.embeddingQueue,
      'ai-ner': this.nerQueue,
      'ai-verify-source': this.verifySourceQueue,
      'ai-translation': this.translationQueue,
      'ai-analysis': this.analysisQueue,
      'ai-suggestions': this.suggestionsQueue,
    };
    const queue = queues[queueName];
    if (!queue) throw new Error('Queue not found');

    const job = await queue.getJob(jobId);
    if (!job) {
      throw new Error('Job not found');
    }
    if (await job.isFailed()) {
      await job.retry();
      return true;
    }
    return false;
  }

  async status() {
    const count = await this.aiTaskRepo.count();
    return {
      status: 'ready',
      processed: count,
    };
  }

  async recentAnalyses(limit = 5): Promise<AiTaskRecord[]> {
    const entities = await this.aiTaskRepo.find({
      order: { created_at: 'DESC' },
      take: limit,
    });
    return entities.map((e) => ({
      id: e.id,
      type: e.type,
      status: e.status,
      result: e.result,
      error: e.error,
      completedAt: e.updated_at,
    }));
  }

  runAnalyzeSource(payload: AnalysisPayload) {
    return this.renderer.render(
      `# AI analysis for ${payload.articleSlug}\n\nSource: ${payload.sourceUrl}`,
    );
  }

  runGetSuggestions(payload: SuggestionsPayload) {
    const phenomena = ['apple', 'banana', 'orange'];
    return phenomena
      .filter((phenomenon) => payload.text.includes(phenomenon))
      .map((phenomenon) => ({
        text: phenomenon,
        phenomenonSlug: phenomenon,
      }));
  }

  async runEmbedding(payload: { text: string }): Promise<number[]> {
    const url = process.env.OLLAMA_API_URL || 'http://localhost:11434';
    const response = await fetch(`${url}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'mxbai-embed-large',
        prompt: payload.text,
      }),
    });
    if (!response.ok) {
      throw new Error(`Ollama embedding failed: ${response.statusText}`);
    }
    const data = await response.json();
    return data.embedding;
  }

  async runNer(payload: { text: string }): Promise<string[]> {
    const url = process.env.OLLAMA_API_URL || 'http://localhost:11434';
    const prompt = `Extract named entities from the following text and return them as a comma-separated list. Text: "${payload.text}"`;
    const response = await fetch(`${url}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen:7b',
        prompt,
        stream: false,
      }),
    });
    if (!response.ok) {
      throw new Error(`Ollama NER failed: ${response.statusText}`);
    }
    const data = await response.json();
    return data.response.split(',').map((e: string) => e.trim());
  }

  async runVerifySource(payload: { url: string }): Promise<boolean> {
    try {
      const response = await fetch(payload.url, { method: 'HEAD' });
      return response.ok;
    } catch (e) {
      return false;
    }
  }

  async runTranslation(payload: {
    text: string;
    targetLang: string;
  }): Promise<string> {
    const url = process.env.OLLAMA_API_URL || 'http://localhost:11434';
    const prompt = `Translate the following text to ${payload.targetLang}. Return ONLY the translation. Text: "${payload.text}"`;
    const response = await fetch(`${url}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen:7b',
        prompt,
        stream: false,
      }),
    });
    if (!response.ok) {
      throw new Error(`Ollama translation failed: ${response.statusText}`);
    }
    const data = await response.json();
    return data.response.trim();
  }
}
