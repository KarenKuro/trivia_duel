import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Transactional } from 'typeorm-transactional';

import { CategoriesService } from '@api-resources/categories';

import { CategoryEntity, UserEntity } from '@common/database/entities';
import { UserStatus } from '@common/enums';
import { ResponseManager } from '@common/helpers';
import { ERROR_MESSAGES } from '@common/messages';
import { ICategory, IId, IUser, IUserId } from '@common/models';

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
      relations: [
        'categories',
        'categories.translatedCategories',
        'categories.image',
      ],
    });

    if (user.status === UserStatus.LOCKED) {
      throw ResponseManager.buildError(ERROR_MESSAGES.USER_ARE_BLOCKED);
    }

    return user;
  }

  async findAllAvailableCategory(userId: IUserId): Promise<ICategory[]> {
    const userWithCategories = await this.findOne(userId.id);

    return userWithCategories.categories;
  }

  async addCategoriesAfterRegistration(
    userPayload: IUserId,
    categoryId: IId,
  ): Promise<IUser> {
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

    return user;
  }

  @Transactional()
  async updateUser(
    userId: number,
    newUserData: QueryDeepPartialEntity<IUser>,
  ): Promise<void> {
    const updatedUser = await this._userRepository.update(userId, newUserData);
    if (updatedUser.affected === 0) {
      throw ResponseManager.buildError(ERROR_MESSAGES.USER_NOT_EXISTS);
    }
  }

  // @Transactional()
  // async addPoints(users: IUser[], matchData: IMatch): Promise<void> {
  // TODO add points and if need level up;
  //
  //
  // level: newLevel
  // await this.updateUser(user.id, { points });
  // }
}
