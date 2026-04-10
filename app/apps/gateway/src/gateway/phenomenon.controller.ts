import {
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
  Param,
  Request,
  UseGuards,
  Body,
} from '@nestjs/common';
import { PhenomenonDomainService } from '@synop/domains';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { VoteAlternativeDto } from '../dto/vote-alternative.dto';

@Controller('phenomena')
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
  }),
)
export class PhenomenonController {
  constructor(
    private readonly phenomenonDomainService: PhenomenonDomainService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('alternatives/:alternativeId/vote')
  async voteForAlternative(
    @Param('alternativeId') alternativeId: string,
    @Body() dto: VoteAlternativeDto,
    @Request() req: any,
  ) {
    return this.phenomenonDomainService.voteForAlternative({
      alternativeId,
      userId: req.user.id,
    });
  }
}
