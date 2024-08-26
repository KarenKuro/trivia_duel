import { ApiProperty } from '@nestjs/swagger';

import { Expose, Type } from 'class-transformer';

export class LanguageResponseDTO {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @Type(() => String)
  @ApiProperty()
  key: string;

  @ApiProperty()
  native: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
