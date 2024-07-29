import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transactional } from 'typeorm-transactional';

import { CategoryEntity, UserEntity } from '@common/database/entities';
import { ICategory, IId, IUser } from '@common/models';
import { IUserId } from '@common/models/common/user-id';
import { ResponseManager } from '@common/helpers';
import { ERROR_MESSAGES } from '@common/messages';
import { IBuyCategory } from '@common/models/category/buy-category';
import { CategoriesService } from '@api-resources/categories';

@Injectable()
export class UserService {
  constructor(
    private readonly _categoriesService: CategoriesService,

    @InjectRepository(UserEntity)
    private readonly _userRepository: Repository<UserEntity>,
  ) {}

  async findOne(id: number): Promise<IUser> {
    const user = await this._userRepository.findOne({
      where: { id },
      relations: ['categories'],
    });

    return user;
  }

  async findAllAvailableCategory(userId: IUserId): Promise<ICategory[]> {
    const userWithCategories = await this.findOne(userId.id);

    return userWithCategories.categories;
  }

  async addCategoriesAfterRegistration(
    userPayload: IUserId,
    categoryId: IId,
  ): Promise<ICategory[]> {
    const user = await this.findOne(userPayload.id);

    if (user.categories.length) {
      throw ResponseManager.buildError(ERROR_MESSAGES.CATEGORY_ALREADY_EXIST);
    }

    const choosenCategory = (await this._categoriesService.findOne({
      id: +categoryId.id,
    })) as CategoryEntity;

    if (!choosenCategory) {
      throw ResponseManager.buildError(ERROR_MESSAGES.CATEGORY_NOT_EXIST);
    }

    const categories =
      await this._categoriesService.randomlySelectTwoCategories(
        choosenCategory.id,
      );

    user.categories.push(choosenCategory, ...categories);

    await this._userRepository.save(user);

    return user.categories;
  }

  @Transactional()
  async addCategory(userPayload: IUserId, body: IBuyCategory) {
    const categoryId = { id: body.id };
    const category = await this._categoriesService.findOne(categoryId);

    if (!category) {
      throw ResponseManager.buildError(ERROR_MESSAGES.CATEGORY_NOT_EXIST);
    }

    const user = await this.findOne(userPayload.id);

    // if (user.categories.includes(category))

    // if (user.categories.indexOf(category))

    // if (category.id in user.categories)

    const ids: number[] = [];
    user.categories.map((category) => ids.push(category.id));

    if (ids.includes(category.id)) {
      throw ResponseManager.buildError(ERROR_MESSAGES.CATEGORY_ALREADY_EXIST);
    }

    let balance: number;
    let price: number;
    let flag = true;
    if (body.currencyType === 'coins') {
      price = category.price;
      balance = user.coins;
    } else {
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
