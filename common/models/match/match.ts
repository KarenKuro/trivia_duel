import { MatchLevel, MatchStatusType } from '@common/enums';

import { IMatchCategory } from './match-category';
import { IUserAnswerData } from './user-answer-data';
import { IQuestion } from '../question';
import { IUser } from '../user';

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
