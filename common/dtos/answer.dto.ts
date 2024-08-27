import { ApiProperty } from '@nestjs/swagger';

import { Transform } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

import { TranslatedAnswerResponseDTO } from './match-response/translated-answer-response.dto';

export class AnswerDTO {
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

  @ApiProperty({
    type: () => TranslatedAnswerResponseDTO,
    isArray: true,
    uniqueItems: true,
    maxItems: 2,
    minItems: 2,
  })
  translatedAnswers?: TranslatedAnswerResponseDTO[];
}
