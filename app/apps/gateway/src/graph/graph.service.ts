import { Injectable, NotFoundException } from '@nestjs/common';
import { PhenomenonStorageService } from '@synop/domains';

export interface GraphNode {
  id: string;
  label: string;
  group: 'article' | 'concept';
}

export interface GraphLink {
  source: string;
  target: string;
  value: number;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

@Injectable()
export class GraphService {
  constructor(
    private readonly phenomenonStorage: PhenomenonStorageService,
  ) {}

  async getGraphData(articleSlug: string): Promise<GraphData> {
    const manifest = await this.phenomenonStorage.loadManifest(articleSlug);

    if (!manifest) {
      throw new NotFoundException(`Article ${articleSlug} not found`);
    }

    const nodes: GraphNode[] = [
      { id: articleSlug, label: manifest.data.title || articleSlug, group: 'article' }
    ];
    const links: GraphLink[] = [];

    const conceptsSet = new Set<string>();

    for (const blockId of Object.keys(manifest.data.blocks)) {
      const block = manifest.data.blocks[blockId];
      if (block.alternatives && block.alternatives.length > 0) {
        const bestAlternative = block.alternatives[0]; // Simplified for now
        if (bestAlternative.concepts) {
          for (const concept of bestAlternative.concepts) {
            conceptsSet.add(concept);
          }
        }
      }
    }

    for (const concept of conceptsSet) {
      nodes.push({ id: concept, label: concept, group: 'concept' });
      links.push({ source: articleSlug, target: concept, value: 1 });
    }

    return { nodes, links };
  }
}
