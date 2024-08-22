import { IUpdateMedia } from '../media';
import { IUpdateTranslatedCategory } from '../translated-category';

export interface IUpdateCategory {
  text: string;
  price: number;
  premiumPrice: number;
  translatedCategories: IUpdateTranslatedCategory[];
  medias: IUpdateMedia[];
}
