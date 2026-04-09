import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { slugifyBlockLabel } from '@synop/shared-kernel';
import {
  BlockAlternative,
  BlockCatalogEntry,
  NewBlockInput,
  PhenomenonManifest,
} from './phenomenon.types';

export class Manifest {
  private constructor(public readonly data: PhenomenonManifest) {}

  public static createNew(
    slug: string,
    title: string,
    defaultLang: string,
  ): Manifest {
    const manifestData: PhenomenonManifest = {
      article_slug: slug,
      title: title,
      last_updated: new Date().toISOString(),
      default_lang: defaultLang,
      structure: [],
      blocks: {},
    };
    return new Manifest(manifestData);
  }

  public static fromString(jsonString: string): Manifest {
    try {
      const data = JSON.parse(jsonString) as PhenomenonManifest;
      return new Manifest(data);
    } catch (error) {
      throw new Error('Failed to parse manifest string');
    }
  }

  public addBlock(
    block: NewBlockInput,
    changes: Record<string, string>,
  ): string {
    const blockId = `b${uuidv4().slice(0, 3)}`;
    this.data.structure.push({ block_id: blockId, level: block.level });

    const safeTitle = slugifyBlockLabel(block.title || block.type);
    const fileName = `${block.lang}/${blockId}-${safeTitle}.md`;
    const filePath = path.posix.join(fileName);

    const alternative: BlockAlternative = {
      file: filePath,
      lang: block.lang,
      votes: 0,
      concepts: block.concepts || [],
      source: block.source || null,
      trust_score: 0,
    };

    const catalogEntry: BlockCatalogEntry = {
      type: block.type,
      alternatives: [alternative],
    };

    this.data.blocks[blockId] = catalogEntry;
    (this.data as any).last_updated = new Date().toISOString();

    changes[filePath] = block.content;

    return blockId;
  }

  public toString(): string {
    return JSON.stringify(this.data, null, 2);
  }
}
