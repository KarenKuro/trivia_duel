import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CategoryEntity, UserEntity } from '@common/database/entities';
import { ICategory, IId, IUser } from '@common/models';
import { CategoriesService } from '@api-resources/categories';
import { IUserId } from '@common/models/common/user-id';
import { ResponseManager } from '@common/helpers';
import { ERROR_MESSAGES } from '@common/messages';

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
    userId: IUserId,
    categoryId: IId,
  ): Promise<ICategory[]> {
    const choosenCategory = (await this._categoriesService.findOne({
      id: +categoryId.id,
    })) as CategoryEntity;

    if (!choosenCategory) {
      throw ResponseManager.buildError(ERROR_MESSAGES.CATEGORY_NOT_EXIST);
    }

    const user = await this.findOne(userId.id);

    if (user.categories.length) {
      throw ResponseManager.buildError(ERROR_MESSAGES.CATEGORY_ALREADY_EXIST);
    }

    user.categories.push(choosenCategory);

    await this._userRepository.save(user);

    const categories =
      (await this._categoriesService.randomlySelectTwoCategories(
        userId,
      )) as CategoryEntity[];

    user.categories.push(categories[0], categories[1]);

    await this._userRepository.save(user);

    return user.categories;
  }
}
