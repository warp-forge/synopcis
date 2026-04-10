export interface Source {
  type: 'web' | 'offline';
  url?: string;
  identifier?: string;
  page?: string | number;
}

export interface Alternative {
  file: string;
  lang: string;
  votes: number;
  concepts?: string[];
  source: Source | null;
  trust_score: number;
}

export interface BlockData {
  type: 'heading' | 'text' | 'quote' | 'image' | 'property-card';
  alternatives: Alternative[];
}

export interface StructureNode {
  block_id: string;
  level: number;
}

export interface CardLink {
  text: string;
  slug: string;
}

export interface CardProperty {
  property: CardLink;
  value: CardLink;
}

export interface PhenomenonCardData {
  properties: CardProperty[];
}

export interface Manifest {
  article_slug: string;
  title: string;
  last_updated: string;
  default_lang: string;
  card?: PhenomenonCardData;
  structure: StructureNode[];
  blocks: Record<string, BlockData>;
}

// This will be the shape of the data passed to the components
export interface RenderableBlock {
  id: string;
  type: 'heading' | 'text' | 'quote' | 'image' | 'property-card';
  level: number;
  content: string; // The fetched markdown content
  source: Source | null;
  alternativesCount: number;
}

export interface RenderablePhenomenon {
  slug: string;
  title: string;
  cardData?: PhenomenonCardData;
  blocks: RenderableBlock[];
}

export type Block = {
  id: string;
  content: string;
  type: 'heading' | 'paragraph';
  level?: 1 | 2 | 3 | 4 | 5 | 6; // For heading type
  sort: number;
  sourceUrl?: string;
  alternativesCount?: number;
};

export interface Phenomenon {
  id: string;
  slug: string;
  title: string;
  lang_code: string;
  blocks: Block[];
  cardData: PhenomenonCardData;
}
