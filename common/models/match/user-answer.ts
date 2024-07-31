import { IAnswer, IQuestion } from '../question';
import { IUser } from '../user';
import { IMatch } from './match';

export interface IUserAnswer {
  user: IUser;
  match: IMatch;
  answer: IAnswer;
  question: IQuestion;
}
