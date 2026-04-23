import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from './article.entity';
import {
  CreateArticleCommand,
  UpdateArticleMetadataCommand,
  ChangeArticleStatusCommand,
  FreezeArticleCommand,
  LinkArticleConceptCommand,
} from './articles.domain.entity';

@Injectable()
export class ArticlesDomainService {
  constructor(
    @InjectRepository(Article)
    private readonly repository: Repository<Article>,
  ) {}

  async create(command: CreateArticleCommand): Promise<Article> {
    const article = this.repository.create({
      slug: command.slug,
      git_repo_name: command.slug,
    });
    return this.repository.save(article);
  }

  async updateMetadata(
    command: UpdateArticleMetadataCommand,
  ): Promise<Article> {
    const article = await this.repository.findOneBy({
      id: command.articleId as any,
    });
    if (!article) {
      throw new Error('Article not found');
    }
    // TODO: implement metadata update
    // article.title = command.title ?? article.title;
    // article.summary = command.summary ?? article.summary;
    // article.tags = command.tags ?? article.tags;
    // article.canonicalConceptId = command.canonicalConceptId ?? article.canonicalConceptId;
    return this.repository.save(article);
  }

  async changeStatus(command: ChangeArticleStatusCommand): Promise<Article> {
    const article = await this.repository.findOneBy({
      id: command.articleId as any,
    });
    if (!article) {
      throw new Error('Article not found');
    }
    // TODO: implement status change
    // article.status = command.status;
    return this.repository.save(article);
  }

  async freeze(command: FreezeArticleCommand): Promise<Article> {
    const article = await this.repository.findOneBy({
      id: command.articleId as any,
    });
    if (!article) {
      throw new Error('Article not found');
    }
    // TODO: implement freeze logic
    // article.frozenUntil = command.frozenUntil;
    return this.repository.save(article);
  }

  async linkConcept(command: LinkArticleConceptCommand): Promise<Article> {
    const article = await this.repository.findOneBy({
      id: command.articleId as any,
    });
    if (!article) {
      throw new Error('Article not found');
    }
    // TODO: implement concept linking
    return this.repository.save(article);
  }
}
