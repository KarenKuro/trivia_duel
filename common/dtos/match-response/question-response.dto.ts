import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

import { Expose, Type } from 'class-transformer';

import { QuestionType } from '@common/enums';

import { CorrectAnswerIdDTO } from './correct-answer-id.dto';
import { MatchAnswerDTO } from './match-answer.dto';
import { MatchCategoryResponseDTO } from './match-category-response.dto';
import { TranslatedQuestionResponseDTO } from './translated-question-response.dto';

export class QuestionResponseDTO {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  text: string;

  @ApiHideProperty()
  translatedQuestions?: TranslatedQuestionResponseDTO[];

  @Expose()
  @Type(() => MatchAnswerDTO)
  @ApiProperty({
    type: () => MatchAnswerDTO,
    isArray: true,
    uniqueItems: true,
    maxItems: 1,
    minItems: 4,
  })
  answers: MatchAnswerDTO[];

  @Expose()
  @Type(() => CorrectAnswerIdDTO)
  @ApiProperty({ type: () => CorrectAnswerIdDTO })
  correctAnswer: CorrectAnswerIdDTO;

  @Expose()
  @ApiProperty()
  type: QuestionType;

  @Expose()
  @Type(() => MatchCategoryResponseDTO)
  @ApiProperty({ type: MatchCategoryResponseDTO })
  category: MatchCategoryResponseDTO;

  @ApiHideProperty()
  createdAt: Date;

  @ApiHideProperty()
  updatedAt: Date;
}
