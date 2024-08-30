import { ApiProperty } from '@nestjs/swagger';

import { UserResponseDTO } from '@api-resources/user/dto';

import { AnswerDTO } from '@common/dtos/answer.dto';
import { QuestionResponseDTO } from '@common/dtos/match-response';

import { AnswerInSocketDTO } from './answer-in-socket.dto';
import { QuestionInSocketDTO } from './question-in-socket.dto';
import { UserInSocketDTO } from './user-in-socket.dto';

export class LastAnswerInSocketDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  isCorrect: boolean;

  @ApiProperty({ type: UserInSocketDTO })
  user: Omit<UserResponseDTO, 'categories' | 'statistics'>;

  @ApiProperty({ type: QuestionInSocketDTO })
  question: Omit<
    QuestionResponseDTO,
    'translatedQuestions' | 'answers' | 'correctAnswer' | 'category'
  >;

  @ApiProperty({ type: AnswerInSocketDTO })
  answer: Pick<AnswerDTO, 'id' | 'createdAt' | 'updatedAt' | 'text'>;
}
