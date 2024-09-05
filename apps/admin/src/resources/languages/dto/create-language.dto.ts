import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLanguageDTO {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'rus' })
  key: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Русский' })
  native: string;
}
