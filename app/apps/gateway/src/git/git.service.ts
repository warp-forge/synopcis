import { Injectable } from '@nestjs/common';
import { LocalGitRepositoryClient } from '@synop/shared-kernel';

@Injectable()
export class GitService {
  constructor(private readonly gitRepositoryClient: LocalGitRepositoryClient) {}

  async getHistory(repository: string, file: string) {
    return this.gitRepositoryClient.history(repository, { file, limit: 50 });
  }

  async getDiff(
    repository: string,
    file: string,
    commit1: string,
    commit2: string,
  ) {
    const diff = await this.gitRepositoryClient.diffCommits(
      repository,
      commit1,
      commit2,
      file,
    );
    return { diff };
  }
}
