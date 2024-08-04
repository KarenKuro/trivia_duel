import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';

import { CategoryEntity, UserEntity } from '@common/database/entities';
import { IUserId } from '@common/models/common/user-id';
import { ICategory, IQueryBuilderCategory } from '@common/models';
import { Transactional } from 'typeorm-transactional';
import { IBuyCategory } from '@common/models/category/buy-category';
import { ResponseManager } from '@common/helpers';
import { ERROR_MESSAGES } from '@common/messages';
import { CurrencyTypes } from '@common/enums';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly _userRepository: Repository<UserEntity>,

    @InjectRepository(CategoryEntity)
    private readonly _categoryRepository: Repository<CategoryEntity>,
  ) {}

  async findAllWithIsActive(userId: IUserId): Promise<ICategory[]> {
    const id = userId.id;
    const allCategories: IQueryBuilderCategory[] =
      await this._categoryRepository
        .createQueryBuilder('category')
        .leftJoin(
          'users_categories',
          'uc',
          'category.id = uc.category_id AND uc.user_id = :id',
          { id },
        )
        .addSelect(
          'CASE WHEN uc.user_id IS NULL THEN 0 ELSE 1 END AS category_isActive',
        )
        .getRawMany();

    return allCategories.map((category) => ({
      id: category.category_id,
      name: category.category_name,
      price: category.category_price,
      premiumPrice: category.category_premiumPrice,
      createdAt: category.category_created_at,
      updatedAt: category.category_updated_at,
      isActive: Boolean(Number(category.category_isActive)),
    })) as ICategory[];
  }

  async findOne(param: Partial<ICategory>): Promise<ICategory> {
    const category = await this._categoryRepository.findOne({ where: param });

    return category;
  }

  async findAll(): Promise<ICategory[]> {
    const categories = await this._categoryRepository.find();

    return categories;
  }

  async randomlySelectTwoCategories(
    choosenCategoryId: number,
  ): Promise<ICategory[]> {
    const categoriesUserDoesNotHave = await this._categoryRepository.find({
      where: {
        id: Not(choosenCategoryId),
      },
    });

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

  @Transactional()
  async addCategory(
    userPayload: IUserId,
    body: IBuyCategory,
  ): Promise<ICategory> {
    const category = (await this.findOne({ id: body.id })) as CategoryEntity;

    if (!category) {
      throw ResponseManager.buildError(ERROR_MESSAGES.CATEGORY_NOT_EXIST);
    }

    const user = await this._userRepository.findOne({
      where: { id: userPayload.id },
      relations: ['categories'],
    });

    const userCategoryExists = user.categories.some(
      (category) => category.id === body.id,
    );

    if (userCategoryExists) {
      throw ResponseManager.buildError(ERROR_MESSAGES.CATEGORY_ALREADY_EXIST);
    }

    let balance: number = user.coins;
    let price: number = category.price;
    let flag = true;
    if (body.currencyType !== CurrencyTypes.coins) {
      price = category.premiumPrice;
      balance = user.premiumCoins;
      flag = false;
    }

    if (price > balance) {
      throw ResponseManager.buildError(ERROR_MESSAGES.INSUFFICIENT_FUNDS);
    }

    if (flag) {
      user.coins -= price;
    } else {
      user.premiumCoins -= price;
    }
    user.categories.push(category);
    await this._userRepository.save(user);

    return category;
  }
}
