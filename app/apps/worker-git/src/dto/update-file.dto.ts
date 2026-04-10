import { IsISO8601, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateFileDto {
  @IsString()
  @IsNotEmpty()
  repository!: string;

  @IsString()
  @IsNotEmpty()
  filePath!: string;

  @IsString()
  content!: string;

  @IsString()
  @IsNotEmpty()
  summary!: string;

  @IsUrl()
  sourceUrl!: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsOptional()
  @IsISO8601()
  timestamp?: string;
}
