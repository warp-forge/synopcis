import { Injectable } from '@nestjs/common';
import { MarkdownRenderer, TaskMessage } from '@synop/shared-kernel';
import { randomUUID } from 'crypto';

type AnalysisPayload = {
  articleSlug: string;
  sourceUrl: string;
};

type AnalysisRecord = {
  id: string;
  articleSlug: string;
  renderedSummary: string;
  completedAt: Date;
};

type SuggestionsPayload = {
  phenomenonSlug: string;
  text: string;
};

@Injectable()
export class WorkerAiService {
  private readonly processed: AnalysisRecord[] = [];

  constructor(private readonly renderer: MarkdownRenderer) {}

  analyzeSource(task: TaskMessage<AnalysisPayload>) {
    const payload = task.payload;
    const renderedSummary = this.renderer.render(
      `# AI analysis for ${payload.articleSlug}\n\nSource: ${payload.sourceUrl}`,
    );

    this.processed.push({
      id: task.id,
      articleSlug: payload.articleSlug,
      renderedSummary,
      completedAt: new Date(),
    });

    return {
      taskId: task.id,
      type: task.type,
      status: 'completed',
      detail: `analysis prepared for ${payload.articleSlug}`,
    };
  }

  getAiSuggestions(task: TaskMessage<SuggestionsPayload>) {
    const payload = task.payload;
    const phenomena = ['apple', 'banana', 'orange'];
    const suggestions = phenomena
      .filter((phenomenon) => payload.text.includes(phenomenon))
      .map((phenomenon) => ({
        text: phenomenon,
        phenomenonSlug: phenomenon,
      }));

    return {
      taskId: task.id,
      type: task.type,
      status: 'completed',
      detail: `suggestions prepared for ${payload.phenomenonSlug}`,
      payload: suggestions,
    };
  }

  status() {
    return {
      status: 'ready',
      processed: this.processed.length,
    };
  }

  recentAnalyses(limit = 5): AnalysisRecord[] {
    return this.processed.slice(-limit).reverse();
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

  async runGenerateBlocks(payload: { content: string }): Promise<any[]> {
    // Generate simple block split for mock implementation
    return payload.content.split('\n\n').map((paragraph, index) => ({
      id: index,
      type: 'paragraph',
      data: { text: paragraph },
    }));
  }

  async runSynthesize(payload: {
    articles: { lang: string; content: string }[];
  }): Promise<string> {
    const url = process.env.OLLAMA_API_URL || 'http://localhost:11434';
    const combinedContent = payload.articles
      .map((a) => `[${a.lang}]: ${a.content}`)
      .join('\n\n');
    const prompt = `Synthesize a single comprehensive article from the following sources:\n\n${combinedContent}`;
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
      throw new Error(`Ollama synthesize failed: ${response.statusText}`);
    }
    const data = await response.json();
    return data.response.trim();
  }
}
