import { ILanguage } from '../language';
import { IQuestion } from '../question';

export interface ITranslatedQuestion {
  id: number;
  text: string;
  question: IQuestion;
  language: ILanguage;
  createdAt: Date;
  updatedAt: Date;
}
