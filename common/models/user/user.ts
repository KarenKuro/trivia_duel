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
  lives: number;
  createdAt: Date;
  updatedAt: Date;
  matches?: IMatch[];
}
