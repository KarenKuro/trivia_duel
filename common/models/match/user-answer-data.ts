import { IAnswer, IQuestion } from '../question';
import { IUser } from '../user';
import { IMatch } from './match';

export interface IUserAnswerData {
  user: IUser;
  match: IMatch;
  answer: IAnswer;
  question: IQuestion;
}
