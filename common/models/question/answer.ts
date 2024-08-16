import { IQuestion } from './question';

export interface IAnswer {
  id: number;
  text: string;
  question?: IQuestion;
}
