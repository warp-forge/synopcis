import { Test, TestingModule } from '@nestjs/testing';
import { GraphController } from './graph.controller';
import { GraphService } from './graph.service';

describe('GraphController', () => {
  let controller: GraphController;
  let service: GraphService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GraphController],
      providers: [
        {
          provide: GraphService,
          useValue: {
            getGraphData: jest.fn().mockResolvedValue({ nodes: [], links: [] }),
          },
        },
      ],
    }).compile();

    controller = module.get<GraphController>(GraphController);
    service = module.get<GraphService>(GraphService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return empty nodes and links if article is not provided', async () => {
    const result = await controller.getGraph(undefined as any);
    expect(result).toEqual({ nodes: [], links: [] });
  });

  it('should call getGraphData with the provided article slug', async () => {
    await controller.getGraph('test-article');
    expect(service.getGraphData).toHaveBeenCalledWith('test-article');
  });
});
