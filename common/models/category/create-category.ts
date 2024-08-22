import { ICreateTranslatedCategory } from '../translated-category';

export interface ICreateCategory {
  text: string;
  price: number;
  premiumPrice: number;
  // isExclusive?: boolean;
  translatedCategories: ICreateTranslatedCategory[];
  path: string;
}
