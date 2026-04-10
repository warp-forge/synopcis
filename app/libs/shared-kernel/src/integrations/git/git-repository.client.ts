import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import * as path from 'path';
import simpleGit, {
  DefaultLogFields,
  ListLogLine,
  SimpleGit,
} from 'simple-git';

const DEFAULT_GIT_ROOT = '/data/git';
const DEFAULT_BRANCH = 'main';

export type GitCommitFileAction = 'added' | 'updated' | 'removed';

export interface GitCommitFileChange {
  readonly path: string;
  readonly action: GitCommitFileAction;
}

export interface GitCommitMetadata {
  readonly repository: string;
  readonly sourceUrl: string;
  readonly files: GitCommitFileChange[];
}

export interface GitAuthor {
  readonly name: string;
  readonly email?: string;
}

export interface GitCommitInput {
  readonly repository: string;
  readonly summary: string;
  readonly sourceUrl: string;
  readonly author: GitAuthor;
  readonly changes: Record<string, string | null>;
  readonly timestamp?: Date;
}

export interface ArticleBlockDescriptor {
  readonly lang: string;
  readonly blockId: number;
  readonly label: string;
}

export interface ArticleCommitInput
  extends Omit<GitCommitInput, 'changes'> {
  readonly blocks: (ArticleBlockDescriptor & { content: string })[];
}

export interface GitCommitRecord {
  readonly repository: string;
  readonly hash: string;
  readonly summary: string;
  readonly sourceUrl: string;
  readonly files: GitCommitFileChange[];
  readonly author: GitAuthor;
  readonly timestamp: Date;
}

export interface GitHistoryOptions {
  readonly limit?: number;
}

export function slugifyBlockLabel(label: string): string {
  const normalized = label
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

  return normalized.length > 0 ? normalized : 'untitled';
}

export function formatBlockFilePath(descriptor: ArticleBlockDescriptor): string {
  const paddedId = descriptor.blockId.toString().padStart(3, '0');
  return path.posix.join(
    descriptor.lang,
    `b${paddedId}-${slugifyBlockLabel(descriptor.label)}.md`,
  );
}

@Injectable()
export class LocalGitRepositoryClient {
  private readonly root: string;
  private readonly branch: string;
  private readonly worktreeRoot: string;

  constructor() {
    this.root = process.env.GIT_STORAGE_ROOT ?? DEFAULT_GIT_ROOT;
    this.branch = process.env.GIT_DEFAULT_BRANCH ?? DEFAULT_BRANCH;
    this.worktreeRoot = path.join(
      process.env.GIT_WORKTREE_ROOT ?? tmpdir(),
      'synopsis-git-worktrees',
    );
  }

  async initializeRepository(repository: string): Promise<string> {
    const repoPath = this.getRepositoryPath(repository);
    await fs.mkdir(this.root, { recursive: true });

    try {
      await fs.access(repoPath);
      return repoPath;
    } catch {
      await simpleGit().raw(['init', '--bare', repoPath]);
      const bare = this.gitForBare(repository);
      await bare.raw(['symbolic-ref', 'HEAD', `refs/heads/${this.branch}`]);
      return repoPath;
    }
  }

  async cloneRepository(repository: string, destination: string): Promise<void> {
    const repoPath = await this.initializeRepository(repository);
    const absoluteDestination = path.resolve(destination);
    await fs.mkdir(path.dirname(absoluteDestination), { recursive: true });

    await simpleGit().clone(repoPath, absoluteDestination);
  }

  async commit(input: GitCommitInput): Promise<GitCommitRecord> {
    const repoPath = await this.initializeRepository(input.repository);
    const { git, worktree } = await this.prepareWorktree(repoPath);

    try {
      const tracked = await this.listTrackedFiles(git);
      const changed: GitCommitFileChange[] = [];

      for (const [filePath, content] of Object.entries(input.changes)) {
        if (content === null) {
          if (tracked.has(filePath)) {
            await git.rm(filePath);
            changed.push({ path: filePath, action: 'removed' });
          }
          continue;
        }

        const absolutePath = path.join(worktree, filePath);
        await fs.mkdir(path.dirname(absolutePath), { recursive: true });
        await fs.writeFile(absolutePath, content, 'utf8');
        await git.add(filePath);
        changed.push({
          path: filePath,
          action: tracked.has(filePath) ? 'updated' : 'added',
        });
      }

      const status = await git.status();
      if (status.isClean()) {
        throw new Error('No changes to commit');
      }

      const authorEmail = this.buildAuthorEmail(input.author);
      await git.addConfig('user.name', input.author.name);
      await git.addConfig('user.email', authorEmail);

      const metadata: GitCommitMetadata = {
        repository: input.repository,
        sourceUrl: input.sourceUrl,
        files: changed,
      };

      const message = this.buildCommitMessage(
        input.repository,
        input.summary,
        metadata,
      );

      const commitGit = input.timestamp
        ? git.env({
            GIT_AUTHOR_DATE: input.timestamp.toISOString(),
            GIT_COMMITTER_DATE: input.timestamp.toISOString(),
          })
        : git;

      await commitGit.commit(message, undefined, {
        '--author': `${input.author.name} <${authorEmail}>`,
      });

      await git.raw(['push', '-u', 'origin', this.branch]);

      const [latest] = await this.history(input.repository, 1);
      return latest;
    } finally {
      await this.cleanupWorktree(worktree);
    }
  }

  async commitArticle(input: ArticleCommitInput): Promise<GitCommitRecord> {
    const changes: Record<string, string> = {};
    for (const block of input.blocks) {
      changes[formatBlockFilePath(block)] = block.content;
    }

    return this.commit({
      ...input,
      changes,
    });
  }

  async history(
    repository: string,
    limitOrOptions: number | GitHistoryOptions = 10,
  ): Promise<GitCommitRecord[]> {
    await this.initializeRepository(repository);
    const limit =
      typeof limitOrOptions === 'number'
        ? limitOrOptions
        : limitOrOptions.limit ?? 10;

    const log = await this.gitForBare(repository).log({ maxCount: limit });
    return log.all.map((entry) => this.parseCommitEntry(entry));
  }

  async diff(repository: string, hash: string): Promise<string> {
    await this.initializeRepository(repository);
    return this.gitForBare(repository).raw(['diff', `${hash}^!`]);
  }

  async readFile(
    repository: string,
    filePath: string,
    ref = 'HEAD',
  ): Promise<string | null> {
    await this.initializeRepository(repository);
    try {
      const content = await this.gitForBare(repository).show([
        `${ref}:${filePath}`,
      ]);
      return content;
    } catch {
      return null;
    }
  }

  private getRepositoryPath(repository: string): string {
    return path.join(this.root, `${repository}.git`);
  }

  private gitForBare(repository: string): SimpleGit {
    return simpleGit({ baseDir: this.getRepositoryPath(repository) });
  }

  private async prepareWorktree(repoPath: string): Promise<{
    git: SimpleGit;
    worktree: string;
  }> {
    await fs.mkdir(this.worktreeRoot, { recursive: true });
    const worktree = await fs.mkdtemp(
      path.join(this.worktreeRoot, 'worktree-'),
    );
    const git = simpleGit(worktree);

    await git.init();
    await git.addRemote('origin', repoPath);
    try {
      await git.fetch('origin', this.branch);
    } catch {
      // Ignore fetch failures for empty repositories.
    }

    const remoteBranches = await git.branch(['-r']);
    if (remoteBranches.all.includes(`origin/${this.branch}`)) {
      await git.raw(['checkout', '-b', this.branch, '--track', `origin/${this.branch}`]);
    } else {
      await git.checkoutLocalBranch(this.branch);
    }

    try {
      await git.pull('origin', this.branch);
    } catch {
      // Repository might still be empty.
    }

    return { git, worktree };
  }

  private async cleanupWorktree(worktree: string): Promise<void> {
    await fs.rm(worktree, { recursive: true, force: true });
  }

  private async listTrackedFiles(git: SimpleGit): Promise<Set<string>> {
    const output = await git.raw(['ls-files']);
    return new Set(
      output
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0),
    );
  }

  private buildAuthorEmail(author: GitAuthor): string {
    if (author.email) {
      return author.email;
    }

    const fallback = slugifyBlockLabel(author.name)
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-');

    const localPart = fallback.length > 0 ? fallback : 'user';
    return `${localPart}@synop.local`;
  }

  private buildCommitMessage(
    repository: string,
    summary: string,
    metadata: GitCommitMetadata,
  ): string {
    const header = `[${repository}] ${summary.trim()}`;
    const footer = [
      `Source: ${metadata.sourceUrl}`,
      `Metadata: ${JSON.stringify(metadata)}`,
    ].join('\n');

    return `${header}\n\n${footer}`;
  }

  private parseCommitEntry(entry: DefaultLogFields & ListLogLine): GitCommitRecord {
    const summaryInfo = this.parseSummary(entry.message);
    const metadata = this.parseMetadata(entry.body ?? '', summaryInfo.repository);

    return {
      repository: summaryInfo.repository,
      hash: entry.hash,
      summary: summaryInfo.summary,
      sourceUrl: metadata.sourceUrl,
      files: metadata.files,
      author: {
        name: entry.author_name,
        email: entry.author_email,
      },
      timestamp: new Date(entry.date),
    };
  }

  private parseSummary(message: string): {
    repository: string;
    summary: string;
  } {
    const match = message.match(/^\[(?<repo>[^\]]+)\]\s*(?<summary>.*)$/);
    if (match?.groups) {
      return {
        repository: match.groups.repo,
        summary: match.groups.summary,
      };
    }

    return {
      repository: 'unknown',
      summary: message,
    };
  }

  private parseMetadata(
    body: string,
    fallbackRepository: string,
  ): GitCommitMetadata {
    const metadataLine = body
      .split('\n')
      .map((line) => line.trim())
      .find((line) => line.startsWith('Metadata:'));

    if (!metadataLine) {
      return {
        repository: fallbackRepository,
        sourceUrl: '',
        files: [],
      };
    }

    try {
      const parsed = JSON.parse(metadataLine.slice('Metadata:'.length).trim());
      return {
        repository: typeof parsed.repository === 'string'
          ? parsed.repository
          : fallbackRepository,
        sourceUrl: typeof parsed.sourceUrl === 'string' ? parsed.sourceUrl : '',
        files: Array.isArray(parsed.files)
          ? parsed.files
              .map((file: Partial<GitCommitFileChange>) => ({
                path: typeof file.path === 'string' ? file.path : '',
                action:
                  file.action === 'added' || file.action === 'removed'
                    ? file.action
                    : 'updated',
              }))
              .filter((file) => file.path.length > 0)
          : [],
      };
    } catch {
      return {
        repository: fallbackRepository,
        sourceUrl: '',
        files: [],
      };
    }
  }
}
