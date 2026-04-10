import { Test, TestingModule } from '@nestjs/testing';
import {
  ArticlesDomainService,
  PhenomenonStorageService,
  Article,
} from '@synop/domains';
import { WorkerIngestionService } from './worker-ingestion.service';
import { WikipediaService } from './wikipedia/wikipedia.service';
import { StorageService } from './storage/storage.service';
import { TaskType, createTaskMessage } from '@synop/shared-kernel';
import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';

describe('WorkerIngestionService', () => {
  let service: WorkerIngestionService;
  let wikipediaService: WikipediaService;
  let storageService: StorageService;
  let natsClient: ClientProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkerIngestionService,
        { provide: StorageService, useValue: { storeArticle: jest.fn() } },
        { provide: WikipediaService, useValue: { getArticle: jest.fn() } },
        {
          provide: 'NATS_SERVICE',
          useValue: {
            send: jest.fn((pattern, data) => {
              if (pattern === TaskType.AI_SYNTHESIZE) {
                return of('synthesized content');
              }
              if (pattern === TaskType.AI_TRANSLATE) {
                return of(`translated to ${data.payload.lang}`);
              }
              return of(null);
            }),
          },
        },
      ],
    }).compile();

    service = module.get<WorkerIngestionService>(WorkerIngestionService);
    wikipediaService = module.get<WikipediaService>(WikipediaService);
    storageService = module.get<StorageService>(StorageService);
    natsClient = module.get<ClientProxy>('NATS_SERVICE');
  });

  it('should process an ingestion task', async () => {
    const articleName = 'test-article';
    const languages = ['en', 'es'];
    const task = createTaskMessage({
      type: TaskType.INGEST_WIKIPEDIA,
      payload: { articleName, languages },
    });

    (wikipediaService.getArticle as jest.Mock).mockImplementation((name, lang) =>
      Promise.resolve({ content: `content in ${lang}` }),
    );

    await service.ingestWikipedia(task);

    expect(wikipediaService.getArticle).toHaveBeenCalledWith(articleName, 'en');
    expect(natsClient.send).toHaveBeenCalledWith(
      TaskType.AI_SYNTHESIZE,
      expect.any(Object),
    );
    expect(natsClient.send).toHaveBeenCalledWith(
      TaskType.AI_TRANSLATE,
      expect.any(Object),
    );
    expect(storageService.storeArticle).toHaveBeenCalled();
  });
});
