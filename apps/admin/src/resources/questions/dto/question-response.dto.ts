import { QuestionType } from '@common/enums';
import { ApiProperty } from '@nestjs/swagger';
import { AnswerDTO, CorrectAnswerDTO, TranslatedQuestionResponseDTO } from './';

export class QuestionResponseDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  text: string;

  @ApiProperty({ type: () => AnswerDTO, isArray: true })
  answers: AnswerDTO[];

  @ApiProperty({ type: () => CorrectAnswerDTO })
  correctAnswer: CorrectAnswerDTO;

  @ApiProperty()
  type: QuestionType;

  @ApiProperty()
  category: { id: number };

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: () => TranslatedQuestionResponseDTO, isArray: true })
  translatedQuestions?: TranslatedQuestionResponseDTO[];
}
