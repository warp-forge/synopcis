import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class AddAlternativeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  repository: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lang: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsNumber()
  level: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  sourceUrl?: string;
}

export class VoteAlternativeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  repository: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  file: string;
}
