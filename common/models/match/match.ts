import { MatchLevel, MatchStatusType } from '@common/enums';
import { IUser } from '../user';
import { IQuestion } from '../question';
import { IUserAnswer } from './user-answer';
import { IMatchCategory } from './match-category';

export interface IMatch {
  id: number;
  status: MatchStatusType;
  users: IUser[];
  categories?: IMatchCategory[];
  questions: IQuestion[];
  lastAnswer?: IUserAnswer;
  matchLevel: MatchLevel;
  createdAt: Date;
  updatedAt: Date;
}
