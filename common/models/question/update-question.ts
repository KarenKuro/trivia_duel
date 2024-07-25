import { IQuestion } from './question';

export interface IUpdateQuestion {
  question: string;
  answers?: IAnswer[];
  correctAnswerId?: number;
  categoryId?: number;
}

export interface IAnswer {
  id: number;
  value: string;
  question?: IQuestion;
}
