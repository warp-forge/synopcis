import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import * as path from 'path';
import {
  formatBlockFilePath,
  LocalGitRepositoryClient,
} from './git-repository.client';

jest.setTimeout(30000);

describe('LocalGitRepositoryClient', () => {
  let root: string;
  let client: LocalGitRepositoryClient;
  const repository = 'albert-einstein';

  beforeEach(async () => {
    root = await fs.mkdtemp(path.join(tmpdir(), 'synop-git-test-'));
    process.env.GIT_STORAGE_ROOT = path.join(root, 'git');
    process.env.GIT_WORKTREE_ROOT = path.join(root, 'worktrees');
    client = new LocalGitRepositoryClient();
  });

  afterEach(async () => {
    delete process.env.GIT_STORAGE_ROOT;
    delete process.env.GIT_WORKTREE_ROOT;
    await fs.rm(root, { recursive: true, force: true });
  });

  it('stores each block as an atomic file in the repository', async () => {
    const commit = await client.commitArticle({
      repository,
      summary: 'Add introduction blocks',
      sourceUrl: 'https://example.com/source',
      author: { name: 'Ada Lovelace', email: 'ada@example.com' },
      blocks: [
        {
          lang: 'en',
          blockId: 1,
          label: 'Introduction',
          content: '# Biography\n',
        },
        {
          lang: 'ru',
          blockId: 1,
          label: 'Введение',
          content: '# Биография\n',
        },
      ],
    });

    const englishPath = formatBlockFilePath({
      lang: 'en',
      blockId: 1,
      label: 'Introduction',
    });
    const russianPath = formatBlockFilePath({
      lang: 'ru',
      blockId: 1,
      label: 'Введение',
    });

    const english = await client.readFile(repository, englishPath);
    const russian = await client.readFile(repository, russianPath);

    expect(english).toContain('# Biography');
    expect(russian).toContain('# Биография');
    expect(commit.files).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: englishPath, action: 'added' }),
        expect.objectContaining({ path: russianPath, action: 'added' }),
      ]),
    );
  });

  it('preserves alternatives when committing new blocks', async () => {
    await client.commitArticle({
      repository,
      summary: 'Create base block',
      sourceUrl: 'https://example.com/base',
      author: { name: 'Ada Lovelace', email: 'ada@example.com' },
      blocks: [
        {
          lang: 'en',
          blockId: 1,
          label: 'Introduction',
          content: '# Biography\n',
        },
      ],
    });

    await client.commitArticle({
      repository,
      summary: 'Add alternative translation',
      sourceUrl: 'https://example.com/alt',
      author: { name: 'Grace Hopper' },
      blocks: [
        {
          lang: 'en',
          blockId: 1,
          label: 'Academic tone',
          content: '# Biography (Academic)\n',
        },
      ],
    });

    const primaryPath = formatBlockFilePath({
      lang: 'en',
      blockId: 1,
      label: 'Introduction',
    });
    const alternativePath = formatBlockFilePath({
      lang: 'en',
      blockId: 1,
      label: 'Academic tone',
    });

    const baseContent = await client.readFile(repository, primaryPath);
    const alternativeContent = await client.readFile(repository, alternativePath);

    expect(baseContent).toContain('# Biography');
    expect(alternativeContent).toContain('# Biography (Academic)');
  });

  it('returns rich commit history with metadata and diffs', async () => {
    await client.commitArticle({
      repository,
      summary: 'Initial content',
      sourceUrl: 'https://example.com/initial',
      author: { name: 'Ada Lovelace', email: 'ada@example.com' },
      blocks: [
        {
          lang: 'en',
          blockId: 1,
          label: 'Introduction',
          content: '# Biography\n',
        },
      ],
    });

    const secondCommit = await client.commitArticle({
      repository,
      summary: 'Add russian translation',
      sourceUrl: 'https://example.com/russian',
      author: { name: 'Grace Hopper' },
      blocks: [
        {
          lang: 'ru',
          blockId: 1,
          label: 'Введение',
          content: '# Биография\n',
        },
      ],
    });

    const history = await client.history(repository, 5);
    expect(history[0]).toMatchObject({
      repository,
      summary: 'Add russian translation',
      sourceUrl: 'https://example.com/russian',
    });
    expect(history[0].files).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: formatBlockFilePath({
          lang: 'ru',
          blockId: 1,
          label: 'Введение',
        }) }),
      ]),
    );

    const diff = await client.diff(repository, secondCommit.hash);
    expect(diff).toContain('b001-');
    expect(diff).toContain('# Биография');
  });

  it('allows cloning repositories into working directories', async () => {
    await client.commitArticle({
      repository,
      summary: 'Initial content',
      sourceUrl: 'https://example.com/initial',
      author: { name: 'Ada Lovelace', email: 'ada@example.com' },
      blocks: [
        {
          lang: 'en',
          blockId: 1,
          label: 'Introduction',
          content: '# Biography\n',
        },
      ],
    });

    const destination = path.join(root, 'clone');
    await client.cloneRepository(repository, destination);

    const cloneFile = await fs.readFile(
      path.join(destination, 'en', 'b001-introduction.md'),
      'utf8',
    );

    expect(cloneFile).toContain('# Biography');
  });
});
