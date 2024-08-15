import { ILanguage } from '../language';
import { IAnswer } from '../question';

export interface ITranslatedAnswer {
  id: number;
  translatedAnswers: string[];
  answer: IAnswer;
  language: ILanguage;
  createdAt: Date;
  updatedAt: Date;
}
