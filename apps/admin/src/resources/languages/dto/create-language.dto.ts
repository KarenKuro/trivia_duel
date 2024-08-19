import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLanguageDTO {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  key: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  native: string;
}
