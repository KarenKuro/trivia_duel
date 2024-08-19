import {
  AnswerEntity,
  CategoryEntity,
  TranslatedQuestionEntity,
} from '@common/database/entities';
import { QuestionType } from '@common/enums';

export interface IQuestion {
  id: number;
  text: string;
  answers: AnswerEntity[];
  translatedQuestions: TranslatedQuestionEntity[];
  correctAnswer: AnswerEntity;
  type: QuestionType;
  category: CategoryEntity;
  createdAt: Date;
  updatedAt: Date;
}
