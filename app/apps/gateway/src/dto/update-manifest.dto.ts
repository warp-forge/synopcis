import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsArray, ValidateNested, IsObject, IsOptional, IsNumber } from 'class-validator';

export class BlockSourceDto {
  @IsString()
  @ApiProperty()
  type: 'web' | 'offline';

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  url?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  identifier?: string;

  @IsOptional()
  @ApiProperty({ required: false })
  page?: string | number;
}

export class BlockAlternativeDto {
  @IsString()
  @ApiProperty()
  file: string;

  @IsString()
  @ApiProperty()
  lang: string;

  @IsNumber()
  @ApiProperty()
  votes: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ApiProperty({ required: false, type: [String] })
  concepts?: string[];

  @ValidateNested()
  @Type(() => BlockSourceDto)
  @IsOptional()
  @ApiProperty({ required: false, type: BlockSourceDto })
  source: BlockSourceDto | null;

  @IsNumber()
  @ApiProperty()
  trust_score: number;
}

export class BlockCatalogEntryDto {
  @IsString()
  @ApiProperty()
  type: 'heading' | 'text' | 'quote' | 'image' | 'property-card';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BlockAlternativeDto)
  @ApiProperty({ type: [BlockAlternativeDto] })
  alternatives: BlockAlternativeDto[];
}

export class StructureEntryDto {
  @IsString()
  @ApiProperty()
  block_id: string;

  @IsNumber()
  @ApiProperty()
  level: number;
}

export class UpdateManifestDto {
  @IsString()
  @ApiProperty()
  article_slug: string;

  @IsString()
  @ApiProperty()
  title: string;

  @IsString()
  @ApiProperty()
  last_updated: string;

  @IsString()
  @ApiProperty()
  default_lang: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StructureEntryDto)
  @ApiProperty({ type: [StructureEntryDto] })
  structure: StructureEntryDto[];

  @IsObject()
  @ApiProperty()
  blocks: Record<string, any>;
}
