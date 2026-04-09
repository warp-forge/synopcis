import { Body, Controller, Param, Put, Req, UsePipes, ValidationPipe, UseGuards, UnauthorizedException } from '@nestjs/common';
import { PhenomenonStorageService } from '@synop/domains';
import { UpdateManifestDto } from '../dto/update-manifest.dto';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/manifests')
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
  }),
)
export class ManifestController {
  constructor(
    private readonly phenomenonStorageService: PhenomenonStorageService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Put(':phenomenon_id')
  async updateManifest(
    @Param('phenomenon_id') phenomenonId: string,
    @Body() dto: UpdateManifestDto,
    @Req() request: Request,
  ) {
    const user = request.user as { id: string; email: string };
    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }
    const author = { name: user.email, email: user.email };

    return this.phenomenonStorageService.updateFullManifest(phenomenonId, dto, author);
  }
}
