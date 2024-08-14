import { ITranslatedCategory } from '../translated-category';

export interface ICategory {
  id: number;
  name: string;
  price: number;
  premiumPrice: number;
  // isExclusive: boolean;
  createdAt: Date;
  updatedAt: Date;
  isActive?: boolean;
  translatedCategories: ITranslatedCategory[];
}
