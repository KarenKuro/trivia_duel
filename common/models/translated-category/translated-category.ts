import { ICategory } from '../category';
import { ILanguage } from '../language';

export interface ITranslatedCategory {
  id: number;
  translatedName: string;
  category: ICategory;
  language: ILanguage;
  createdAt: Date;
  updatedAt: Date;
}
