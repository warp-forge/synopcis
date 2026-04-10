import { Test } from '@nestjs/testing';
import { ClientProxy } from '@nestjs/microservices';
import { TaskType } from '@synop/shared-kernel';
import {
  PhenomenonStorageService,
  UpdatePhenomenonBlocksInput,
} from './phenomenon-storage.service';
import { NewBlockInput, PhenomenonManifest } from './phenomenon.types';
import { PhenomenonDomainService } from './phenomenon.domain.service';
import { Manifest } from './manifest';
import { of } from 'rxjs';

const mockNatsClient = {
  send: jest.fn((pattern, data) => {
    if (pattern === TaskType.GIT_READ_FILE) {
      const manifest = Manifest.createNew(
        'test-phenomenon',
        'Test Phenomenon',
        'en',
      );
      return of(manifest.toString());
    }
    return of(null);
  }),
};

const mockPhenomenonDomainService = {
  createPhenomenon: jest.fn(),
};

describe('PhenomenonStorageService', () => {
  let service: PhenomenonStorageService;

  const phenomenonSlug = 'test-phenomenon';

  const MOCK_BLOCK: NewBlockInput = {
    type: 'text',
    lang: 'en',
    level: 2,
    content: 'This is a test block.',
    title: 'Test Block',
  };

  const MOCK_INPUT: UpdatePhenomenonBlocksInput = {
    phenomenonSlug,
    summary: 'Add content',
    sourceUrl: 'https://example.com/source',
    author: { name: 'Test Author' },
    blocks: [MOCK_BLOCK],
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PhenomenonStorageService,
        {
          provide: 'NATS_SERVICE',
          useValue: mockNatsClient,
        },
        {
          provide: PhenomenonDomainService,
          useValue: mockPhenomenonDomainService,
        },
      ],
    }).compile();

    service = module.get(PhenomenonStorageService);
    jest.clearAllMocks();
  });

  describe('createPhenomenon', () => {
    it('initializes a repository and creates an initial manifest', async () => {
      mockPhenomenonDomainService.createPhenomenon.mockResolvedValue({
        slug: phenomenonSlug,
        userId: 'test-user',
      });

      await service.createPhenomenon({
        slug: phenomenonSlug,
        title: 'Test Phenomenon',
        author: { name: 'Test Author' },
        userId: 'test-user',
      });

      expect(mockNatsClient.send).toHaveBeenCalledWith(
        TaskType.GIT_INIT,
        expect.any(Object),
      );
      expect(mockNatsClient.send).toHaveBeenCalledWith(
        TaskType.GIT_COMMIT,
        expect.any(Object),
      );
      expect(
        mockPhenomenonDomainService.createPhenomenon,
      ).toHaveBeenCalledWith({
        title: phenomenonSlug,
        userId: 'test-user',
      });
    });
  });

  describe('updatePhenomenonBlocks', () => {
    it('adds new blocks to an existing manifest', async () => {
      await service.updatePhenomenonBlocks(MOCK_INPUT);

      expect(mockNatsClient.send).toHaveBeenCalledWith(
        TaskType.GIT_COMMIT,
        expect.any(Object),
      );
    });
  });
});
