import { QuestionType } from '@common/enums';

export interface ICreateQuestion {
  question: string;
  answers: string[];
  correctAnswer: string;
  type: QuestionType;
  categoryId: number;
}
