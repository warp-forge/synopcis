import { Test, TestingModule } from '@nestjs/testing';
import { GraphService } from './graph.service';
import { PhenomenonStorageService } from '@synop/domains';
import { NotFoundException } from '@nestjs/common';

describe('GraphService', () => {
  let service: GraphService;
  let phenomenonStorage: PhenomenonStorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GraphService,
        {
          provide: PhenomenonStorageService,
          useValue: {
            loadManifest: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GraphService>(GraphService);
    phenomenonStorage = module.get<PhenomenonStorageService>(PhenomenonStorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw NotFoundException if manifest is not found', async () => {
    jest.spyOn(phenomenonStorage, 'loadManifest').mockResolvedValue(null);
    await expect(service.getGraphData('non-existent')).rejects.toThrow(NotFoundException);
  });

  it('should return correct graph data for a manifest with concepts', async () => {
    const mockManifest = {
      data: {
        title: 'Test Article',
        blocks: {
          b1: {
            alternatives: [
              { concepts: ['concept-1', 'concept-2'] },
            ],
          },
          b2: {
            alternatives: [
              { concepts: ['concept-2', 'concept-3'] },
            ],
          },
        },
      },
    };
    jest.spyOn(phenomenonStorage, 'loadManifest').mockResolvedValue(mockManifest as any);

    const result = await service.getGraphData('test-article');

    expect(result.nodes).toHaveLength(4); // 1 article + 3 unique concepts
    expect(result.links).toHaveLength(3);

    expect(result.nodes).toContainEqual({ id: 'test-article', label: 'Test Article', group: 'article' });
    expect(result.nodes).toContainEqual({ id: 'concept-1', label: 'concept-1', group: 'concept' });
    expect(result.nodes).toContainEqual({ id: 'concept-2', label: 'concept-2', group: 'concept' });
    expect(result.nodes).toContainEqual({ id: 'concept-3', label: 'concept-3', group: 'concept' });

    expect(result.links).toContainEqual({ source: 'test-article', target: 'concept-1', value: 1 });
    expect(result.links).toContainEqual({ source: 'test-article', target: 'concept-2', value: 1 });
    expect(result.links).toContainEqual({ source: 'test-article', target: 'concept-3', value: 1 });
  });
});
