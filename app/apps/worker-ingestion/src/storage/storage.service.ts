import { Injectable, Logger } from '@nestjs/common';
import { ArticlesDomainService } from '@synop/domains/bounded-contexts/knowledge/articles/domain/articles.service';
import { LocalGitRepositoryClient, GitAuthor } from '@synop/shared-kernel';
import { CreateArticleCommand } from '@synop/domains/bounded-contexts/knowledge/articles/domain/articles.domain.entity';
import { PhenomenonStorageService, NewBlockInput } from '@synop/domains';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  constructor(
    private readonly articlesDomainService: ArticlesDomainService,
    private readonly gitRepositoryClient: LocalGitRepositoryClient,
    private readonly phenomenonStorage: PhenomenonStorageService,
  ) {}

  async storePhenomenonBlocks(
    phenomenonSlug: string,
    blocks: NewBlockInput[],
    author: GitAuthor,
  ) {
    this.logger.log(`Storing ${blocks.length} blocks for "${phenomenonSlug}"`);
    await this.phenomenonStorage.updatePhenomenonBlocks({
      phenomenonSlug,
      blocks,
      author,
      summary: 'AI draft generation',
      sourceUrl: 'synop://kernel.synop.one/ai-draft',
    });
  }

  async storeArticle(
    articleName: string,
    translatedArticles: { lang: string; content: string }[],
  ): Promise<void> {
    this.logger.log(`Storing article "${articleName}"`);
    const createArticleCommand: CreateArticleCommand = {
      slug: articleName,
      title: articleName,
    };
    const article = await this.articlesDomainService.create(createArticleCommand);

    const blocks = translatedArticles.map(({ lang, content }, index) => ({
      lang,
      blockId: index + 1,
      label: 'content',
      content,
    }));

    await this.gitRepositoryClient.commitArticle({
      repository: article.git_repo_name,
      summary: `Initial import of article "${articleName}"`,
      sourceUrl: 'wikipedia',
      author: { name: 'Ingestion Worker' },
      blocks,
    });
  }
}
