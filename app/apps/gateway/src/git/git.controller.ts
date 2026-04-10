import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { GitService } from './git.service';

@Controller('git')
export class GitController {
  constructor(private readonly gitService: GitService) {}

  @Get('history')
  async getHistory(
    @Query('file') file: string,
    @Query('repository') repository: string,
    @Query('limit') limit?: string,
  ) {
    if (!repository) {
      throw new BadRequestException('repository query parameter is required');
    }
    if (!file) {
      throw new BadRequestException('file query parameter is required');
    }
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.gitService.getHistory(repository, file, limitNum);
  }

  @Get('diff')
  async getDiff(
    @Query('file') file: string,
    @Query('commit1') commit1: string,
    @Query('commit2') commit2: string,
    @Query('repository') repository: string,
  ) {
    if (!repository) {
      throw new BadRequestException('repository query parameter is required');
    }
    if (!file) {
      throw new BadRequestException('file query parameter is required');
    }
    if (!commit1 || !commit2) {
      throw new BadRequestException(
        'commit1 and commit2 query parameters are required',
      );
    }
    return this.gitService.getDiff(repository, file, commit1, commit2);
  }
}
