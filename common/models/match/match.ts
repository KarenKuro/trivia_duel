import { MatchLevel, MatchStatusType } from '@common/enums';
import { IUser } from '../user';
import { ICategory } from '../category';
import { IQuestion } from '../question';
import { IUserAnswer } from './user-answer';

export interface IMatch {
  id: number;
  status: MatchStatusType;
  users: IUser[];
  categories?: ICategory[];
  questions: IQuestion[];
  lastAnswer?: IUserAnswer;
  matchLevel: MatchLevel;
  createdAt: Date;
  updatedAt: Date;
}
