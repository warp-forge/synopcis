import { Inject, Injectable } from '@nestjs/common';
import {
  COLLECTION_REPOSITORY,
  CollectionAggregate,
  AddArticleToCollectionCommand,
  ChangeCollectionVisibilityCommand,
  CreateCollectionCommand,
  RemoveArticleFromCollectionCommand,
} from './collections.domain.entity';
import type { CollectionRepository } from './collections.domain.entity';

@Injectable()
export class CollectionsDomainService {
  constructor(
    @Inject(COLLECTION_REPOSITORY)
    private readonly repository: CollectionRepository,
  ) {}

  async create(command: CreateCollectionCommand): Promise<CollectionAggregate> {
    // TODO: implement collection creation logic
    throw new Error('CollectionsDomainService.create not implemented');
  }

  async addArticle(
    command: AddArticleToCollectionCommand,
  ): Promise<CollectionAggregate> {
    // TODO: implement add article logic
    throw new Error('CollectionsDomainService.addArticle not implemented');
  }

  async removeArticle(
    command: RemoveArticleFromCollectionCommand,
  ): Promise<CollectionAggregate> {
    // TODO: implement remove article logic
    throw new Error('CollectionsDomainService.removeArticle not implemented');
  }

  async changeVisibility(
    command: ChangeCollectionVisibilityCommand,
  ): Promise<CollectionAggregate> {
    // TODO: implement change visibility logic
    throw new Error(
      'CollectionsDomainService.changeVisibility not implemented',
    );
  }
}
