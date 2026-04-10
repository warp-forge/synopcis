import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { GitService } from './git.service';

@Controller('api/git')
export class GitController {
  constructor(private readonly gitService: GitService) {}

  @Get('history')
  async getHistory(
    @Query('file') file: string,
    @Query('repository') repository?: string,
  ) {
    if (!file) {
      throw new BadRequestException('file query parameter is required');
    }
    const repo = repository || 'phenomenon';
    return this.gitService.getHistory(repo, file);
  }

  @Get('diff')
  async getDiff(
    @Query('file') file: string,
    @Query('commit1') commit1: string,
    @Query('commit2') commit2: string,
    @Query('repository') repository?: string,
  ) {
    if (!file) {
      throw new BadRequestException('file query parameter is required');
    }
    if (!commit1 || !commit2) {
      throw new BadRequestException(
        'commit1 and commit2 query parameters are required',
      );
    }
    const repo = repository || 'phenomenon';
    return this.gitService.getDiff(repo, file, commit1, commit2);
  }
}
