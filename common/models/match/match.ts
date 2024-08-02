import { MatchLevel, MatchStatusType } from '@common/enums';
import { IUser } from '../user';
import { IQuestion } from '../question';
import { IUserAnswerData } from './user-answer-data';
import { IMatchCategory } from './match-category';

export interface IMatch {
  id: number;
  status: MatchStatusType;
  users: IUser[];
  categories?: IMatchCategory[];
  questions: IQuestion[];
  lastAnswer?: IUserAnswerData;
  matchLevel: MatchLevel;
  createdAt: Date;
  updatedAt: Date;
}
