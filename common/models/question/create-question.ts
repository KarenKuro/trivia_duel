import { QuestionType } from '@common/enums';

import { ICreateAnswer } from './create-answer';
import { ICreateTranslatedQuestion } from '../translated-question';

export interface ICreateQuestion {
  text: string;
  answers: ICreateAnswer[];
  correctAnswer: string;
  type: QuestionType;
  categoryId: number;
  translatedQuestion: ICreateTranslatedQuestion[];
}
