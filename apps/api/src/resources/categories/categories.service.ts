import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserService } from '@api-resources/user';
import { CategoryEntity } from '@common/database/entities';
import { IUserId } from '@common/models/common/user-id';
import { ICategory } from '@common/models';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly _userService: UserService,

    @InjectRepository(CategoryEntity)
    private readonly _categoryRepository: Repository<CategoryEntity>,
  ) {}

  async findAllWithIsActive(userId: IUserId): Promise<ICategory[]> {
    const user = await this._userService.findOne(userId.id);

    const categories = await this._categoryRepository.find();

    const categoriesWithIsActive = categories.map((category) => ({
      ...category,
      isActive:
        user.categories.some(
          (userCategory) => userCategory.id === category.id,
        ) || false,
    }));

    return categoriesWithIsActive;

    // const id = userId.id;
    // const allCategories = await this._categoryRepository
    //   .createQueryBuilder('category')
    //   .leftJoin('category.users', 'user', 'user.id = :id', { id })
    //   .addSelect(
    //     'CONVERT(CASE WHEN user.id IS NULL THEN 0 ELSE 1 END, SIGNED) AS category_isActive',
    //   )
    //   .getMany();

    // return allCategories;
  }

  async findAllAvailable(userId: IUserId): Promise<ICategory[]> {
    const userWithCategories = await this._userService.findOne(userId.id);

    return userWithCategories.categories;
  }

  async findOne(param: Partial<ICategory>): Promise<ICategory> {
    const category = await this._categoryRepository.findOne({ where: param });

    return category;
  }

  async randomlySelectTwoCategories(userId: IUserId): Promise<ICategory[]> {
    const id = userId.id;
    const categoriesUserDoesNotHave = await this._categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.users', 'user', 'user.id = :id', {
        id,
      })
      .where('user.id IS NULL')
      .getMany();

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
