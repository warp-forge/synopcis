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

  it('should return correct graph data with semantic proximity for concepts', async () => {
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

    // 1 article + 3 unique concepts = 4 nodes
    expect(result.nodes).toHaveLength(4);

    // 3 main article -> concept links = 3 links
    expect(result.links).toHaveLength(3);

    // Verify main article node
    expect(result.nodes).toContainEqual({
      id: 'test-article',
      label: 'Test Article',
      group: 'article',
      semanticProximity: 1.0
    });

    // Total concept occurrences: 'concept-1' (1), 'concept-2' (2), 'concept-3' (1) = 4
    expect(result.nodes).toContainEqual(expect.objectContaining({
      id: 'concept-1',
      group: 'concept',
      semanticProximity: 0.25
    }));

    expect(result.nodes).toContainEqual(expect.objectContaining({
      id: 'concept-2',
      group: 'concept',
      semanticProximity: 0.5
    }));
  });
});
