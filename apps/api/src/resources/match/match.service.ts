import {
  CategoryEntity,
  MatchCategoryEntity,
  MatchEntity,
  UserEntity,
} from '@common/database/entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { MatchGateway } from './match.gateway';
import { IUserId } from '@common/models/common/user-id';
import { ICategories, ICategory, IMatch } from '@common/models';
import { MatchStatusType } from '@common/enums';
import { MatchHelpers, ResponseManager } from '@common/helpers';
import { ERROR_MESSAGES } from '@common/messages';
import { UserService } from '@api-resources/user';
import {
  MATCH_CATEGORIES_MAX_LENGTH,
  MATCH_USER_CATEGORIES_MAX_LENGTH,
} from '@common/constants';
import { CategoriesService } from '@api-resources/categories';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class MatchService {
  constructor(
    @InjectRepository(MatchEntity)
    private readonly _matchRepository: Repository<MatchEntity>,

    @InjectRepository(MatchCategoryEntity)
    private readonly _matchCategoryRepository: Repository<MatchCategoryEntity>,

    // @InjectRepository(MatchCategoryEntity)
    // private readonly _matchCategoryRepository: Repository<MatchCategoryEntity>,

    private readonly _userService: UserService,

    private readonly _categoriesService: CategoriesService,

    private readonly _matchGateway: MatchGateway,
  ) {}

  async createOrJoinMatch(userPayload: IUserId): Promise<IMatch> {
    const user = await this._userService.findOne(userPayload.id);

    const currMatch = await this._matchRepository.findOne({
      where: {
        users: {
          id: user.id,
        },
        status: In([
          MatchStatusType.IN_PROCESS,
          MatchStatusType.CATEGORY_CHOOSE,
          MatchStatusType.PENDING,
        ]),
      },
    });

    if (currMatch) {
      throw ResponseManager.buildError(ERROR_MESSAGES.USER_ALREADY_IN_MATCH);
    }

    const matchLevel = MatchHelpers.getLevel(user.level);

    const match = await this._matchRepository.findOne({
      where: {
        matchLevel,
        status: MatchStatusType.PENDING,
      },
      relations: ['users'],
    });

    let newMatch: MatchEntity;
    if (match && match.users.length !== 2) {
      const users = match.users;
      users.push(user as UserEntity);

      match.users = users;

      const newStatus = MatchStatusType.CATEGORY_CHOOSE;
      match.status = newStatus;

      newMatch = await this._matchRepository.save(match);
    } else {
      newMatch = await this._matchRepository.save({
        users: [user],
        matchLevel,
      });
    }

    this._matchGateway.sendMessageToHandlers(newMatch);

    return newMatch; //++++++++++++++++++++++++Крон джоб, чтобы юзер не ждал больше 10 секунд
  }

  @Transactional()
  async selectCategories(
    id: number,
    categoriesObj: ICategories,
    userPayload: IUserId,
  ): Promise<void> {
    const match = await this._matchRepository.findOne({
      where: { id, status: MatchStatusType.CATEGORY_CHOOSE },
      relations: [
        'users',
        'users.categories',
        'categories',
        'categories.category',
        'categories.user',
      ],
    });

    if (!match) {
      throw ResponseManager.buildError(ERROR_MESSAGES.INCORRECT_MATCH_MAKING);
    }

    console.log('match.users', match.users);
    const user = match.users.find((user) => user.id === userPayload.id);
    console.log('userPayload.id', userPayload.id);
    console.log('user', user);

    if (!user) {
      throw ResponseManager.buildError(ERROR_MESSAGES.INCORRECT_MATCH_ID);
    }

    if (match.categories.length >= MATCH_CATEGORIES_MAX_LENGTH) {
      throw ResponseManager.buildError(ERROR_MESSAGES.ALL_CATEGORIES_SELECTED);
    }

    const userSelectedCategories: MatchCategoryEntity[] =
      match.categories.filter(
        (category) => category.user.id === userPayload.id,
      );

    if (userSelectedCategories?.length >= MATCH_USER_CATEGORIES_MAX_LENGTH) {
      throw ResponseManager.buildError(
        ERROR_MESSAGES.ALL_USER_CATEGORIES_SELECTED,
      );
    }

    const userCategoryIds: number[] = user.categories.map(
      (category) => category.id,
    );

    console.log('categoriesObj', categoriesObj);

    categoriesObj.categories.forEach((categoryId) => {
      if (!userCategoryIds.includes(categoryId)) {
        throw ResponseManager.buildError(ERROR_MESSAGES.CATEGORY_NOT_EXIST);
      }
    });

    const matchCategoryIds: number[] = match.categories.map(
      (matchCategory) => matchCategory.category.id,
    );

    const hasOpponentChoose = Boolean(match.categories?.length);

    for (const category of user.categories) {
      if (
        categoriesObj.categories.includes(category.id) &&
        !matchCategoryIds.includes(category.id)
      ) {
        const matchCategory = await this._matchCategoryRepository.save({
          user: user,
          category: category,
          match: match,
        });
        match.categories.push(matchCategory);
      }
    }

    if (hasOpponentChoose) {
      const categoriesLeftCount: number =
        MATCH_CATEGORIES_MAX_LENGTH - match.categories.length;

      if (categoriesLeftCount > 0) {
        const matchExistsCategoriesIds: number[] = match.categories.map(
          (matchCategory) => matchCategory.category.id,
        );

        const allCategories: ICategory[] =
          await this._categoriesService.findAll();

        const randomCategories: CategoryEntity[] = [];

        while (
          randomCategories.length + matchExistsCategoriesIds.length !==
          MATCH_CATEGORIES_MAX_LENGTH
        ) {
          const randomIndex = Math.floor(Math.random() * allCategories.length);
          const category = allCategories[randomIndex];

          if (
            !matchExistsCategoriesIds.includes(category.id) &&
            !randomCategories.some(
              (randomCategory) => randomCategory.id === category.id,
            )
          ) {
            randomCategories.push(category as CategoryEntity);
          }
        }
        for (const category of randomCategories) {
          const matchCategory = await this._matchCategoryRepository.save({
            user: null,
            category: category,
            match: match,
          });

          match.categories.push(matchCategory);
        }
      }

      // приклеить рандомный вопрос из каждой категории
      match.status = MatchStatusType.IN_PROCESS;
      await this._matchRepository.save(match);

      console.log('gonna broadcast');
      const matchData = await this.getMatchDataToSend(id);
      this._matchGateway.sendMessageToHandlers(matchData);
    }
  }

  // async answer(id: number, userId: number, body: any) {
  //   // Database kpahe useri answery
  //   // lastAnswery kpoxe or exni weronshyal asnwery
  //   // u socketow kjampe matchy(nerqewi gracy)

  //   const match = await this.getMatchDataToSend(id);
  //   this._matchGateway.sendMessageToHandlers(match);
  // }

  async getMatchDataToSend(id: number): Promise<MatchEntity> {
    const match = await this._matchRepository.findOne({
      where: {
        id,
      },
      relations: [
        'users',
        'lastAnswer',
        'lastAnswer.user',
        'lastAnswer.question',
        'lastAnswer.answer',
      ],
    });

    return match;
  }
}
