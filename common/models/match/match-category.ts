import { ICategory } from '../category';
import { IUser } from '../user';
import { IMatch } from './match';

export interface IMatchCategory {
  user?: IUser;
  category: ICategory;
  match: IMatch;
}
