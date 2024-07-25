import { QuestionType } from '@common/enums';
import { ApiProperty } from '@nestjs/swagger';
import { AnswerDTO } from './update-question.dto';

export class QuestionResponseDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  question: string;

  @ApiProperty({ type: () => AnswerDTO, isArray: true })
  answers: AnswerDTO[];

  @ApiProperty({ type: () => AnswerDTO })
  correctAnswer: AnswerDTO;

  @ApiProperty()
  type: QuestionType;

  @ApiProperty()
  category: { id: number };

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
