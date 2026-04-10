import { IsString, IsUrl, IsOptional } from 'class-validator';

export class CreateRenderTaskDto {
  @IsString()
  slug!: string;

  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'] }, { message: 'source must be a valid URL' })
  source?: string;
}
