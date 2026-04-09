import { Body, Controller, Param, Put, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { PhenomenonStorageService } from '@synop/domains';
import { UpdateManifestDto } from '../dto/update-manifest.dto';
import { Request } from 'express';

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

  @Put(':phenomenon_id')
  async updateManifest(
    @Param('phenomenon_id') phenomenonId: string,
    @Body() dto: UpdateManifestDto,
    @Req() request: Request,
  ) {
    const user = request.user as { id: string; email: string };
    const author = user ? { name: user.email, email: user.email } : { name: 'Anonymous', email: 'anonymous@synop.one' };

    return this.phenomenonStorageService.updateFullManifest(phenomenonId, dto, author);
  }
}
