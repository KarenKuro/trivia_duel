import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Transactional } from 'typeorm-transactional';

import { CategoriesService } from '@api-resources/categories';

import { MAIN_LANGUAGE } from '@common/constants';
import {
  CategoryEntity,
  StatisticsEntity,
  UserEntity,
} from '@common/database/entities';
import { UserStatus } from '@common/enums';
import { ResponseManager } from '@common/helpers';
import { ERROR_MESSAGES } from '@common/messages';
import { ICategory, IId, IStatistics, IUser, IUserId } from '@common/models';

@Injectable()
export class UserService {
  constructor(
    private readonly _categoriesService: CategoriesService,

    @InjectRepository(UserEntity)
    private readonly _userRepository: Repository<UserEntity>,

    @InjectRepository(StatisticsEntity)
    private readonly _statisticsRepository: Repository<StatisticsEntity>,
  ) {}

  async findOne(id: number, language: string): Promise<IUser> {
    if (language !== MAIN_LANGUAGE) {
      const user = await this._userRepository.findOne({
        where: { id },
        relations: [
          'categories',
          'categories.translatedCategories',
          'categories.translatedCategories.language',
          'categories.image',
          'statistics',
        ],
      });

      if (user.status === UserStatus.LOCKED) {
        throw ResponseManager.buildError(ERROR_MESSAGES.USER_ARE_BLOCKED);
      }

      const categories = user.categories.map((userCategory) => {
        const translatedCategory = userCategory.translatedCategories.find(
          (translatedCategory) => translatedCategory.language.key === language,
        );

        userCategory.text = translatedCategory.text;
        return userCategory;
      });

      user.categories = categories;
      return user;
    }

    const user = await this._userRepository.findOne({
      where: { id },
      relations: ['categories', 'categories.image', 'statistics'],
    });

    if (user.status === UserStatus.LOCKED) {
      throw ResponseManager.buildError(ERROR_MESSAGES.USER_ARE_BLOCKED);
    }

    return user;
  }

  async findAllAvailableCategory(
    userId: IUserId,
    language: string,
  ): Promise<ICategory[]> {
    const userWithCategories = await this.findOne(userId.id, language);

    return userWithCategories.categories;
  }

  async addCategoriesAfterRegistration(
    userPayload: IUserId,
    categoryId: IId,
    language: string,
  ): Promise<IUser> {
    const user = await this.findOne(userPayload.id, language);

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

  @Transactional()
  async updateStatistics(
    id: number,
    newStatisticsData: QueryDeepPartialEntity<IStatistics>,
  ): Promise<void> {
    const updatedStatistics = await this._statisticsRepository.update(
      id,
      newStatisticsData,
    );
    if (updatedStatistics.affected === 0) {
      throw ResponseManager.buildError(ERROR_MESSAGES.STATISTICS_NOT_EXISTS);
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
