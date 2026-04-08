import { Inject, Injectable } from '@nestjs/common';
import {
  KNOWLEDGE_SEARCH_PORT,
  SearchArticlesQuery,
  SearchConceptsQuery,
  SearchResult,
} from './search.domain.entity';
import type {
  KnowledgeSearchPort,
} from './search.domain.entity';

@Injectable()
export class SearchDomainService {
  constructor(
    @Inject(KNOWLEDGE_SEARCH_PORT)
    private readonly searchPort: KnowledgeSearchPort,
  ) {}

  async searchArticles(
    query: SearchArticlesQuery,
  ): Promise<readonly SearchResult<any>[]> {
    // TODO: implement article search orchestration
    throw new Error('SearchDomainService.searchArticles not implemented');
  }

  async searchConcepts(
    query: SearchConceptsQuery,
  ): Promise<readonly SearchResult<any>[]> {
    // TODO: implement concept search orchestration
    throw new Error('SearchDomainService.searchConcepts not implemented');
  }
}
