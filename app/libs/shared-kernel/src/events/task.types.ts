export enum TaskType {
  RENDER_STATIC = 'render.static',
  ANALYZE_SOURCE = 'analyze.source',
  MIRROR_GIT = 'mirror.git',
  UPDATE_SEARCH_INDEX = 'search.index.update',
  INGEST_WIKIPEDIA = 'ingest.wikipedia',
  CREATE_PHENOMENON = 'create.phenomenon',
  GENERATE_AI_DRAFT = 'generate.ai.draft',
  AI_DRAFT = 'ai.draft',
  GET_AI_SUGGESTIONS = 'get.ai.suggestions',
  AI_EMBEDDING = 'ai.embedding',
  AI_NER = 'ai.ner',
  AI_VERIFY_SOURCE = 'ai.verify.source',
  AI_TRANSLATE = 'ai.translate',

  GIT_INIT = 'git.init',
  GIT_COMMIT = 'git.commit',
  GIT_READ_FILE = 'git.read.file',
}

export type TaskPriority = 'low' | 'normal' | 'high';
