import { Injectable, Logger, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { TaskMessage, TaskType, createTaskMessage } from '@synop/shared-kernel';
import { WikipediaService } from './wikipedia/wikipedia.service';
import { StorageService } from './storage/storage.service';
import { lastValueFrom } from 'rxjs';

type IngestionPayload = {
  articleName: string;
  languages: string[];
};

type AiDraftPayload = {
  phenomenonSlug: string;
  wikipediaArticle: string;
  lang: string;
  userId: string;
};

type IngestionRecord = {
  id: string;
  articleName: string;
  languages: string[];
  completedAt: Date;
};

@Injectable()
export class WorkerIngestionService {
  private readonly processed: IngestionRecord[] = [];
  private readonly logger = new Logger(WorkerIngestionService.name);

  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    private readonly wikipediaService: WikipediaService,
    private readonly storageService: StorageService,
  ) {}

  async aiDraft(task: TaskMessage<AiDraftPayload>) {
    const { phenomenonSlug, wikipediaArticle, lang, userId } = task.payload;
    this.logger.log(`Generating AI draft for "${phenomenonSlug}" from "${wikipediaArticle}" in ${lang}`);
    const { content } = await this.wikipediaService.getArticle(wikipediaArticle, lang);
    const blocks = await lastValueFrom(
      this.natsClient.send(
        TaskType.AI_GENERATE_BLOCKS,
        createTaskMessage({
          type: TaskType.AI_GENERATE_BLOCKS,
          payload: { content },
        }),
      ),
    );
    // TODO: get author from user session
    const author = { name: userId, email: `${userId}@synop.one` };
    await this.storageService.storePhenomenonBlocks(phenomenonSlug, blocks, author);
    this.processed.push({
      id: task.id,
      articleName: wikipediaArticle,
      languages: [lang],
      completedAt: new Date(),
    });
    return {
      taskId: task.id,
      type: task.type,
      status: 'completed',
      detail: `Generated AI draft for "${phenomenonSlug}"`,
      payload: { blocks },
    };
  }

  async ingestWikipedia(task: TaskMessage<IngestionPayload>) {
    const { articleName, languages } = task.payload;
    this.logger.log(`Processing article "${articleName}" in languages: ${languages.join(', ')}`);

    const articles = await Promise.all(
      languages.map(async (lang) => {
        try {
          const article = await this.wikipediaService.getArticle(articleName, lang);
          return { lang, content: article.content };
        } catch (error) {
          this.logger.error(`Failed to fetch article "${articleName}" in ${lang}`, error);
          return { lang, content: '', error };
        }
      }),
    );

    const successfulArticles = articles.filter((a) => !a.error);
    const commonEdition = await lastValueFrom(
      this.natsClient.send(
        TaskType.AI_SYNTHESIZE,
        createTaskMessage({
          type: TaskType.AI_SYNTHESIZE,
          payload: { articles: successfulArticles },
        }),
      ),
    );

    const translatedArticles = await Promise.all(
      languages.map(async (lang) => {
        try {
          const translated = await lastValueFrom(
            this.natsClient.send(
              TaskType.AI_TRANSLATE,
              createTaskMessage({
                type: TaskType.AI_TRANSLATE,
                payload: { content: commonEdition, lang },
              }),
            ),
          );
          return { lang, content: translated };
        } catch (error) {
          this.logger.error(
            `Failed to translate article "${articleName}" to ${lang}`,
            error,
          );
          return { lang, content: '', error };
        }
      }),
    );

    await this.storageService.storeArticle(articleName, translatedArticles.filter((a) => !a.error));

    this.processed.push({
      id: task.id,
      articleName,
      languages,
      completedAt: new Date(),
    });

    return {
      taskId: task.id,
      type: task.type,
      status: 'completed',
      detail: `Stored article "${articleName}" in ${languages.length} languages.`,
      payload: translatedArticles,
    };
  }

  status() {
    return {
      status: 'ready',
      processed: this.processed.length,
    };
  }

  recentIngestions(limit = 5): IngestionRecord[] {
    return this.processed.slice(-limit).reverse();
  }
}
