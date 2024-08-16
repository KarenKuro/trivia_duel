import { ICategory } from '../category';
import { ILanguage } from '../language';

export interface ITranslatedCategory {
  id: number;
  text: string;
  category: ICategory;
  language: ILanguage;
  createdAt: Date;
  updatedAt: Date;
}
