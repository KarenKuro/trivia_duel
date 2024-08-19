import { ApiProperty } from '@nestjs/swagger';

import { CategoryResponseWithoutTranslationsDTO } from '@admin-resources/categories/dto';

import { QuestionType } from '@common/enums';

import { AnswerDTO, CorrectAnswerDTO, TranslatedQuestionResponseDTO } from './';

export class QuestionResponseDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  text: string;

  @ApiProperty({
    type: () => AnswerDTO,
    isArray: true,
    uniqueItems: true,
    maxItems: 1,
    minItems: 4,
  })
  answers: AnswerDTO[];

  @ApiProperty({ type: () => CorrectAnswerDTO })
  correctAnswer: CorrectAnswerDTO;

  @ApiProperty()
  type: QuestionType;

  @ApiProperty({ type: CategoryResponseWithoutTranslationsDTO })
  category: CategoryResponseWithoutTranslationsDTO;

  // category: { id: number };

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({
    type: () => TranslatedQuestionResponseDTO,
    isArray: true,
    uniqueItems: true,
    maxItems: 2,
    minItems: 2,
  })
  translatedQuestions?: TranslatedQuestionResponseDTO[];
}
