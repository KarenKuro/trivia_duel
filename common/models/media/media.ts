import { ICategory } from "../category";

export interface IMedia {
  id: number;
  path: string;
  category: ICategory;
  createdAt: Date;
  updatedAt: Date;
}