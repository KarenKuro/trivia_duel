import { ApiProperty } from '@nestjs/swagger';

import { Expose, Type } from 'class-transformer';

export class CorrectAnswerIdDTO {
  @Expose()
  @Type(() => CorrectAnswerIdDTO)
  @ApiProperty()
  id: number;
}
