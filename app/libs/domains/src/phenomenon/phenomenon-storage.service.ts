import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { TaskType, createTaskMessage } from '@synop/shared-kernel';
import { lastValueFrom } from 'rxjs';

export interface GitAuthor {
  name: string;
  email: string;
}

export interface GitCommitInput {
  repository: string;
  summary: string;
  sourceUrl: string;
  author: GitAuthor;
  changes: Record<string, string>;
}
import { PhenomenonDomainService } from './phenomenon.domain.service';
import { PhenomenonEntity } from './phenomenon.entity';
import { NewBlockInput } from './phenomenon.types';
import { Manifest } from './manifest';

export interface UpdatePhenomenonBlocksInput
  extends Omit<GitCommitInput, 'changes' | 'repository'> {
  readonly phenomenonSlug: string;
  readonly blocks: NewBlockInput[];
}

export interface CreatePhenomenonInput {
  readonly slug: string;
  readonly title: string;
  readonly author: GitAuthor;
  readonly userId: string;
}

const MANIFEST_FILE_PATH = 'manifest.json';

@Injectable()
export class PhenomenonStorageService {
  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    private readonly phenomenonDomainService: PhenomenonDomainService,
  ) {}

  async createPhenomenon(
    input: CreatePhenomenonInput,
  ): Promise<PhenomenonEntity> {
    await lastValueFrom(
      this.natsClient.send(
        TaskType.GIT_INIT,
        createTaskMessage({
          type: TaskType.GIT_INIT,
          payload: { repository: input.slug },
        }),
      ),
    );

    const phenomenon = await this.phenomenonDomainService.createPhenomenon({
      title: input.slug,
      userId: input.userId,
    });

    const manifest = Manifest.createNew(input.slug, input.title, 'en');
    const titleBlock: NewBlockInput = {
      type: 'heading',
      lang: 'en',
      level: 1,
      content: `# ${input.title.trim()}`,
      title: input.title,
    };

    const changes: Record<string, string> = {};
    manifest.addBlock(titleBlock, changes);
    changes[MANIFEST_FILE_PATH] = manifest.toString();

    await lastValueFrom(
      this.natsClient.send(
        TaskType.GIT_COMMIT,
        createTaskMessage({
          type: TaskType.GIT_COMMIT,
          payload: {
            repository: input.slug,
            author: input.author,
            summary: 'Initial commit',
            sourceUrl: 'synop://kernel.synop.one/init',
            changes,
          },
        }),
      ),
    );

    return phenomenon;
  }

  async updatePhenomenonBlocks(input: UpdatePhenomenonBlocksInput) {
    const manifest = await this.loadManifest(input.phenomenonSlug);
    if (!manifest) {
      throw new Error(
        `Manifest for phenomenon "${input.phenomenonSlug}" not found.`,
      );
    }

    const changes: Record<string, string> = {};

    for (const block of input.blocks) {
      manifest.addBlock(block, changes);
    }
    changes[MANIFEST_FILE_PATH] = manifest.toString();

    return lastValueFrom(
      this.natsClient.send(
        TaskType.GIT_COMMIT,
        createTaskMessage({
          type: TaskType.GIT_COMMIT,
          payload: {
            repository: input.phenomenonSlug,
            ...input,
            changes,
          },
        }),
      ),
    );
  }

  async loadManifest(repository: string): Promise<Manifest | null> {
    const content = await lastValueFrom(
      this.natsClient.send(
        TaskType.GIT_READ_FILE,
        createTaskMessage({
          type: TaskType.GIT_READ_FILE,
          payload: { repository, filePath: MANIFEST_FILE_PATH },
        }),
      ),
    );
    if (!content) {
      return null;
    }
    try {
      return Manifest.fromString(content);
    } catch {
      return null;
    }
  }

  async getBlockContents(
    repository: string,
    manifest: Manifest,
  ): Promise<Record<string, string>> {
    const blockContents: Record<string, string> = {};
    const manifestData = manifest.data;

    for (const blockId in manifestData.blocks) {
      if (manifestData.blocks.hasOwnProperty(blockId)) {
        const block = manifestData.blocks[blockId];
        if (block.alternatives && block.alternatives.length > 0) {
          // For now, just read the first alternative.
          // TODO: Implement logic to select the best alternative.
          const alternative = block.alternatives[0];
          const content = await lastValueFrom(
            this.natsClient.send(
              TaskType.GIT_READ_FILE,
              createTaskMessage({
                type: TaskType.GIT_READ_FILE,
                payload: { repository, filePath: alternative.file },
              }),
            ),
          );
          blockContents[blockId] = content || '';
        }
      }
    }

    return blockContents;
  }
}
