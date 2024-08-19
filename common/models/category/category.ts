import { ITranslatedCategory } from '../translated-category';

export interface ICategory {
  id: number;
  text: string;
  price: number;
  premiumPrice: number;
  // isExclusive: boolean;
  createdAt: Date;
  updatedAt: Date;
  isActive?: boolean;
  translatedCategories?: ITranslatedCategory[];
}
