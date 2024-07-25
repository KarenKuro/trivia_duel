import { AnswerEntity } from '@common/database/entities';
import { QuestionType } from '@common/enums';

export interface IQuestion {
  id: number;
  question: string;
  answers: AnswerEntity[];
  correctAnswer: AnswerEntity;
  type: QuestionType;
  category: { id: number };
  createdAt: Date;
  updatedAt: Date;
}
