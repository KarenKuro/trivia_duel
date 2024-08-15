import { ICreateTranslatedAnswers } from '../translated-answers';

export interface ICreateAnswer {
  text: string;
  translatedAnswers: ICreateTranslatedAnswers[];
}
