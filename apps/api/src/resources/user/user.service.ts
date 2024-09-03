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
import {
  ICategory,
  IId,
  ILeaderBoardUserData,
  IPosition,
  IQueryBuilderUser,
  IStatistics,
  IUser,
  IUserId,
} from '@common/models';

@Injectable()
export class UserService {
  constructor(
    private readonly _categoriesService: CategoriesService,

    @InjectRepository(UserEntity)
    private readonly _userRepository: Repository<UserEntity>,

    @InjectRepository(StatisticsEntity)
    private readonly _statisticsRepository: Repository<StatisticsEntity>,
  ) {}

  async findOne(id: number, language?: string): Promise<IUser> {
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

  public async getLeaderboard(userId: number): Promise<ILeaderBoardUserData[]> {
    const entityManager = this._userRepository.manager;
    const count: number = await this._userRepository.count();

    const subquery = entityManager
      .createQueryBuilder()
      .select('users')
      .addSelect('ROW_NUMBER() OVER (ORDER BY users.points DESC)', 'position')
      .from(UserEntity, 'users');

    const myPositionQuery = entityManager
      .createQueryBuilder()
      .select('position')
      .from(`(${subquery.getQuery()})`, 'users')
      .where('users.users_id = :id', { id: userId });

    const myPositionResult: IPosition = await myPositionQuery.getRawOne();
    const myPosition = myPositionResult
      ? Number(myPositionResult.position)
      : null;

    const leaders: ILeaderBoardUserData[] = [];

    let offset = 0;
    const take = 10;

    if (myPosition - 6 > 0) {
      offset = myPosition - 6;
    }

    if (myPosition + 5 > count) {
      offset = count - 10;
      if (offset < 0) {
        offset = 0;
      }
    }

    const leadersQuery = entityManager
      .createQueryBuilder()
      .select('*')
      .addSelect('position')
      .from(`(${subquery.getQuery()})`, 'users')
      .skip(offset)
      .take(take)
      .orderBy('position', 'ASC');

    const leadersData: IQueryBuilderUser[] = await leadersQuery.getRawMany();

    for (const user of leadersData) {
      leaders.push({
        position: Number(user.position),
        id: user.users_id,
        name: user.users_name,
        points: user.users_points,
        avatar: user.users_avatar,
      });
    }

    return leaders;
  }

  // @Transactional()
  // async addPoints(users: IUser[], matchData: IMatch): Promise<void> {
  // TODO add points and if need level up;
  //
  //
  // level: newLevel
  // await this.updateUser(user.id, { points });
  // }

  // async didUserPlayFiveDays(user: UserEntity): Promise<boolean> {
  //   const howManyDaysUserPlay = 0;

  //   return true;
  // }
}
