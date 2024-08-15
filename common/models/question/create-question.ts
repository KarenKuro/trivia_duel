import { QuestionType } from '@common/enums';
import { ICreateTranslatedQuestion } from '../translated-question';
import { ICreateAnswer } from './create-answer';

export interface ICreateQuestion {
  question: string;
  answers: ICreateAnswer[];
  correctAnswer: string;
  type: QuestionType;
  categoryId: number;
  translatedQuestion: ICreateTranslatedQuestion[];
}
