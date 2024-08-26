import { ApiProperty } from '@nestjs/swagger';

import { Expose } from 'class-transformer';

export class MediaResponseDTO {
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  path: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
