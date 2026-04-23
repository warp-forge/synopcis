import { Body, Controller, Post, UsePipes, ValidationPipe, Param, Request, UseGuards } from '@nestjs/common';
import { PhenomenonDomainService } from '@synop/domains';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AddAlternativeDto, VoteAlternativeDto } from '../dto/blocks.dto';

@Controller('blocks')
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
  }),
)
export class BlocksController {
  constructor(private readonly phenomenonDomainService: PhenomenonDomainService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':blockId/alternatives')
  async addAlternative(@Param('blockId') blockId: string, @Body() dto: AddAlternativeDto, @Request() req: any) {
    return this.phenomenonDomainService.addAlternative({
      repository: dto.repository,
      blockId,
      title: dto.title,
      level: dto.level,
      content: dto.content,
      lang: dto.lang,
      sourceUrl: dto.sourceUrl,
      authorId: req.user.id,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post(':blockId/votes')
  async voteForAlternative(@Param('blockId') blockId: string, @Body() dto: VoteAlternativeDto, @Request() req: any) {
    return this.phenomenonDomainService.voteForAlternative({
      repository: dto.repository,
      blockId,
      file: dto.file,
      userId: req.user.id,
    });
  }
}
