import { IMatch } from './match';
import { IAnswer, IQuestion } from '../question';
import { IUser } from '../user';

export interface IUserAnswerData {
  user: IUser;
  match: IMatch;
  answer?: IAnswer;
  question: IQuestion;
}
