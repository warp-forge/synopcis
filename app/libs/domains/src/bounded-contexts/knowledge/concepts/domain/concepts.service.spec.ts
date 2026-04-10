import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Concept, ConceptType } from './concept.entity';
import { ConceptsDomainService } from './concepts.service';
import { Label } from './label.entity';

describe('ConceptsDomainService', () => {
  let service: ConceptsDomainService;
  let conceptsRepository: Repository<Concept>;
  let labelsRepository: Repository<Label>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConceptsDomainService,
        {
          provide: getRepositoryToken(Concept),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Label),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ConceptsDomainService>(ConceptsDomainService);
    conceptsRepository = module.get<Repository<Concept>>(
      getRepositoryToken(Concept),
    );
    labelsRepository = module.get<Repository<Label>>(
      getRepositoryToken(Label),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a concept', async () => {
    const concept = new Concept();
    concept.id = 1;
    concept.key = 'test';
    concept.type = ConceptType.CATEGORY;
    jest.spyOn(conceptsRepository, 'create').mockReturnValue(concept);
    jest.spyOn(conceptsRepository, 'save').mockResolvedValue(concept);

    const createdConcept = await service.createConcept(
      'test',
      ConceptType.CATEGORY,
    );
    expect(createdConcept).toEqual(concept);
  });

  it('should add a label', async () => {
    const label = new Label();
    label.id = 1;
    label.concept_id = 1;
    label.lang_code = 'en';
    label.text = 'Test';
    jest.spyOn(labelsRepository, 'create').mockReturnValue(label);
    jest.spyOn(labelsRepository, 'save').mockResolvedValue(label);

    const createdLabel = await service.addLabel(1, 'en', 'Test');
    expect(createdLabel).toEqual(label);
  });
});
