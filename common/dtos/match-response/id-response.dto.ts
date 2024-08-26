import { ApiProperty } from '@nestjs/swagger';

import { Expose } from 'class-transformer';

export class IdResponseDTO {
  @Expose()
  @ApiProperty()
  id: number;
}
