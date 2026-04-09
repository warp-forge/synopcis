import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EditCommentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  body: string;
}
