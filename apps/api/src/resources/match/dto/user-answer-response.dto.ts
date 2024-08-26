import { ApiProperty } from '@nestjs/swagger';

import { Expose, Type } from 'class-transformer';

import { IdResponseDTO } from '@common/dtos';

export class UserAnswerResponseDTO {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @Type(() => IdResponseDTO)
  @ApiProperty({ type: IdResponseDTO })
  user: IdResponseDTO;

  @Expose()
  @Type(() => IdResponseDTO)
  @ApiProperty({ type: IdResponseDTO })
  match: IdResponseDTO;

  @Expose()
  @Type(() => IdResponseDTO)
  @ApiProperty({ type: IdResponseDTO })
  answer: IdResponseDTO;

  @Expose()
  @Type(() => IdResponseDTO)
  @ApiProperty({ type: IdResponseDTO })
  question: IdResponseDTO;

  @Expose()
  @ApiProperty()
  isCorrect: boolean;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}
