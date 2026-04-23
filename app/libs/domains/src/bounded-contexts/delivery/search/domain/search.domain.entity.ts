import { Query, SearchPort, UseCase, VectorEmbedding } from '../../../../core';

export interface SearchResult<T> {
  readonly item: T;
  readonly score: number;
  readonly highlights?: Record<string, string>;
}

export interface KnowledgeSearchPort {
  readonly articleSearch: SearchPort<any>;
  readonly conceptSearch: SearchPort<any>;
}

export const KNOWLEDGE_SEARCH_PORT = Symbol('KNOWLEDGE_SEARCH_PORT');

export interface SearchArticlesQuery extends Query {
  readonly payload: {
    readonly text?: string;
    readonly vector?: VectorEmbedding;
    readonly language?: string;
  };
}

export interface SearchConceptsQuery extends Query {
  readonly payload: {
    readonly text?: string;
    readonly vector?: VectorEmbedding;
    readonly kind?: string;
  };
}

export interface SearchUseCases {
  readonly searchArticles: UseCase<
    SearchArticlesQuery,
    readonly SearchResult<any>[]
  >;
  readonly searchConcepts: UseCase<
    SearchConceptsQuery,
    readonly SearchResult<any>[]
  >;
}

//TODO Provide concrete search adapters for Postgres full-text and vector indices.
