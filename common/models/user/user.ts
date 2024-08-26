import { UserStatus } from '@common/enums';

import { ICategory } from '../category';
import { IMatch } from '../match';

export interface IUser {
  id: number;
  uid: string;
  name: string;
  email: string;
  status: UserStatus;
  categories: ICategory[];
  coins: number;
  premiumCoins: number;
  subscription: boolean;
  level: number;
  points: number;
  tickets: number;
  createdAt: Date;
  updatedAt: Date;
  matches?: IMatch[];
  longestWinCount: number;
  currentWinCount: number;
  avatar?: string;
}
