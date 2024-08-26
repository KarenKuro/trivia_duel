import { ApiProperty } from '@nestjs/swagger';

import { Transform } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class CorrectAnswerDTO {
  @IsNumber()
  @ApiProperty()
  id: number;

  @IsString()
  @Transform(({ value }) => {
    return value?.trim();
  })
  @ApiProperty()
  text: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
