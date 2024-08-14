import { ICreateTranslatedCategory } from '../translated-category';

export interface ICreateCategory {
  name: string;
  price: number;
  premiumPrice: number;
  // isExclusive?: boolean;
  translatedCategory: ICreateTranslatedCategory[];
}
