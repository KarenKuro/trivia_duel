import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

import { Expose } from 'class-transformer';

import { TranslatedAnswerResponseDTO } from './translated-answer-response.dto';

export class MatchAnswerDTO {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  text: string;

  @ApiHideProperty()
  createdAt: Date;

  @ApiHideProperty()
  updatedAt: Date;

  @ApiHideProperty()
  translatedAnswers?: TranslatedAnswerResponseDTO[];
}
