import { IMatch } from './match';
import { ICategory } from '../category';
import { IUser } from '../user';

export interface IMatchCategory {
  user?: IUser;
  category: ICategory;
  match: IMatch;
}
