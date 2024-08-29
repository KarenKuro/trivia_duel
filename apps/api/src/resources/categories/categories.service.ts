import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Not, Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

import { MAIN_LANGUAGE } from '@common/constants';
import { CategoryEntity, UserEntity } from '@common/database/entities';
import { CurrencyTypes, UserStatus } from '@common/enums';
import { FileHelpers, ResponseManager } from '@common/helpers';
import { ERROR_MESSAGES } from '@common/messages';
import { ICategory, IQueryBuilderCategory } from '@common/models';
import { IBuyCategory } from '@common/models/category/buy-category';
import { IUserId } from '@common/models/common/user-id';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly _userRepository: Repository<UserEntity>,

    @InjectRepository(CategoryEntity)
    private readonly _categoryRepository: Repository<CategoryEntity>,
  ) {}

  async findAllWithIsActive(
    userId: IUserId,
    language: string,
  ): Promise<ICategory[]> {
    const id = userId.id;
    const allCategories: IQueryBuilderCategory[] =
      await this._categoryRepository
        .createQueryBuilder('category')
        .select([
          'category.id',
          'category.price',
          'category.premiumPrice',
          'category.created_at',
          'category.updated_at',
        ])
        .addSelect('mf.path')
        .addSelect(
          'CASE WHEN uc.user_id IS NULL THEN 0 ELSE 1 END AS category_isActive',
        )
        .addSelect(
          `CASE WHEN '${language}' = '${MAIN_LANGUAGE}' THEN category.text ELSE tc.text END AS category_text`,
        )
        .leftJoin(
          'users_categories',
          'uc',
          'category.id = uc.category_id AND uc.user_id = :id',
          { id },
        )
        .leftJoin('translated_category', 'tc', 'category.id = tc.category_id')
        .leftJoin('languages', 'l', 'tc.language_id = l.id')
        .leftJoin('media_files', 'mf', 'category.image_id = mf.id')
        .where(
          `(CASE WHEN '${language}' = '${MAIN_LANGUAGE}' THEN TRUE ELSE l.key = '${language}' END)`,
        )
        .distinct(true)
        .getRawMany();

    return allCategories.map((category) => ({
      id: category.category_id,
      text: category.category_text,
      price: category.category_price,
      premiumPrice: category.category_premiumPrice,
      createdAt: category.created_at,
      updatedAt: category.updated_at,
      isActive: Boolean(Number(category.category_isActive)),
      image: FileHelpers.generatePath(category.mf_path),
    })) as ICategory[];
  }

  async findOne(param: Partial<ICategory>): Promise<ICategory> {
    const category = await this._categoryRepository.findOne({
      where: param,
      relations: ['image'],
    });

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

    if (user.status === UserStatus.LOCKED) {
      throw ResponseManager.buildError(ERROR_MESSAGES.USER_ARE_BLOCKED);
    }

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
