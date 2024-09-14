import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateLanguageDTO {
  @IsNotEmpty()
  @Length(2, 2)
  @IsString()
  @ApiProperty({ example: 'ru' })
  key: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Русский' })
  native: string;
}
