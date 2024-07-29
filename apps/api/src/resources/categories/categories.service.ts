import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CategoryEntity } from '@common/database/entities';
import { IUserId } from '@common/models/common/user-id';
import { ICategory } from '@common/models';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly _categoryRepository: Repository<CategoryEntity>,
  ) {}

  async findAllWithIsActive(userId: IUserId): Promise<ICategory[]> {
    const id = userId.id;
    const allCategories = await this._categoryRepository
      .createQueryBuilder('category')
      .leftJoin('category.users', 'user', 'user.id = :id', { id })
      .addSelect(
        'CONVERT(CASE WHEN user.id IS NULL THEN 0 ELSE 1 END, SIGNED) AS category_isActive',
      )
      .getMany();

    return allCategories;
  }

  async findOne(param: Partial<ICategory>): Promise<ICategory> {
    const category = await this._categoryRepository.findOne({ where: param });

    return category;
  }

  async randomlySelectTwoCategories(
    choosenCategoryId: number,
  ): Promise<ICategory[]> {
    const allCategories = await this._categoryRepository.find();

    const categoriesUserDoesNotHave = allCategories.filter(
      (category) => category.id !== choosenCategoryId,
    );

    const twoRandomCategory: ICategory[] = [];
    const randomIndex1 = Math.floor(
      Math.random() * categoriesUserDoesNotHave.length,
    );

    let randomIndex2 = Math.floor(
      Math.random() * categoriesUserDoesNotHave.length,
    );

    while (randomIndex1 === randomIndex2) {
      randomIndex2 = Math.floor(
        Math.random() * categoriesUserDoesNotHave.length,
      );
    }

    twoRandomCategory.push(
      categoriesUserDoesNotHave[randomIndex1],
      categoriesUserDoesNotHave[randomIndex2],
    );

    return twoRandomCategory;
  }
}
