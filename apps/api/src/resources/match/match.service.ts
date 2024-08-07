import {
  CategoryEntity,
  MatchCategoryEntity,
  MatchEntity,
  QuestionEntity,
  UserAnswerEntity,
  UserEntity,
} from '@common/database/entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { MatchGateway } from './match.gateway';
import {
  ICategories,
  ICategory,
  IId,
  IUserAnswer,
  IUserId,
} from '@common/models';
import { MatchLevel, MatchStatusType, QuestionType } from '@common/enums';
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

    @InjectRepository(QuestionEntity)
    private readonly _questionRepository: Repository<QuestionEntity>,

    @InjectRepository(MatchCategoryEntity)
    private readonly _matchCategoryRepository: Repository<MatchCategoryEntity>,

    @InjectRepository(UserAnswerEntity)
    private readonly _userAnswerRepository: Repository<UserAnswerEntity>,

    private readonly _userService: UserService,

    private readonly _categoriesService: CategoriesService,

    private readonly _matchGateway: MatchGateway,

    private readonly _entityManager: EntityManager,
  ) {}

  @Transactional()
  async createOrJoinMatch(userPayload: IUserId): Promise<MatchEntity> {
    const user = await this._userService.findOne(userPayload.id);

    if (user.tickets <= 0) {
      throw ResponseManager.buildError(ERROR_MESSAGES.USER_DONT_HAVE_LIVE);
    }

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
        previousMatch: null,
      },
      relations: ['users'],
    });

    let newMatch: MatchEntity;
    if (match && match.users.length !== 2) {
      match.users.push(user as UserEntity);

      const newStatus = MatchStatusType.CATEGORY_CHOOSE;
      match.status = newStatus;

      newMatch = await this._matchRepository.save(match);
    } else {
      newMatch = await this._matchRepository.save({
        users: [user as UserEntity],
        matchLevel,
      });
    }

    await this._matchGateway.sendMessageToHandlers(newMatch);

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

    if (!match || match.status !== MatchStatusType.CATEGORY_CHOOSE) {
      throw ResponseManager.buildError(ERROR_MESSAGES.INCORRECT_MATCH_MAKING);
    }

    const user = match.users.find((user) => user.id === userPayload.id);

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

      const questions = await this.getRandomQuestionsByMatch(match);
      console.log('questions', questions);
      match.questions = questions;
      match.status = MatchStatusType.IN_PROCESS;
      await this._matchRepository.save(match);

      for (const user of match.users) {
        const newTicketsValue = --user.tickets;

        await this._userService.updateUser(user.id, {
          tickets: newTicketsValue,
        });
      }

      const matchData = await this.getMatchDataToSend(id);
      this._matchGateway.sendMessageToHandlers(matchData);
    }
  }

  async getRandomQuestionsByMatch(
    match: MatchEntity,
  ): Promise<QuestionEntity[]> {
    const categoryIdsString = match.categories
      .map((matchCategory) => matchCategory.category.id)
      .join(',');
    const additionalCondition = [MatchLevel.BRONZE, MatchLevel.SILVER].includes(
      match.matchLevel,
    )
      ? ` q.type != '${QuestionType.SINGLE}' `
      : ' true ';

    const queryString: string = `
        SELECT q.id
        FROM (
            SELECT q.*, 
                   ROW_NUMBER() OVER (PARTITION BY q.category_id ORDER BY RAND()) AS rn
            FROM questions q WHERE q.category_id IN (${categoryIdsString}) AND ${additionalCondition}
        ) q
        WHERE q.rn = 1;
    `;

    console.log('queryString', queryString);

    const rawData: IId[] = await this._entityManager.query(queryString);

    const questionIds = rawData.map((raw) => Number(raw.id));

    const questions = await this._questionRepository.find({
      where: {
        id: In(questionIds),
      },
    });

    return questions;
  }

  @Transactional()
  async answer(userPayload: IUserId, matchId: number, body: IUserAnswer) {
    const match = await this._matchRepository.findOne({
      where: { id: matchId, status: MatchStatusType.IN_PROCESS },
      relations: [
        'users',
        'questions',
        'questions.correctAnswer',
        'questions.answers',
      ],
    });

    if (!match) {
      throw ResponseManager.buildError(ERROR_MESSAGES.INCORRECT_MATCH_ID);
    }

    const user = match.users.find((user) => user.id === userPayload.id);

    if (!user) {
      throw ResponseManager.buildError(ERROR_MESSAGES.INCORRECT_MATCH_ID);
    }

    const question = match.questions.find(
      (question) => question.id === body.questionId,
    );

    if (!question) {
      throw ResponseManager.buildError(ERROR_MESSAGES.QUESTION_NOT_EXIST);
    }

    if (body.answerId) {
      const answer = question.answers.find((item) => item.id === body.answerId);
      if (!answer) {
        throw ResponseManager.buildError(ERROR_MESSAGES.ANSWER_NOT_EXISTS);
      }
    }

    const userAnswerExists = await this._userAnswerRepository.findOne({
      where: {
        match: { id: match.id },
        question: { id: question.id },
        user: { id: user.id },
      },
    });

    if (userAnswerExists) {
      throw ResponseManager.buildError(
        ERROR_MESSAGES.QUESTION_ALREADY_ANSWERED,
      );
    }

    let isSingleTypeAnswerCorrect: boolean = false;
    if (body.answer) {
      const validatedBodyAnswer = body.answer.trim().toLowerCase();

      isSingleTypeAnswerCorrect = question.answers.some(
        (item) => item.value.trim().toLowerCase() === validatedBodyAnswer,
      );
    }

    const userAnswer = body.answerId ? { id: body.answerId } : null;

    const isCorrect =
      (userAnswer && userAnswer.id === question.correctAnswer.id) ||
      isSingleTypeAnswerCorrect;

    const lastAnswer = await this._userAnswerRepository.save({
      user: { id: userPayload.id },
      question: { id: question.id },
      answer: userAnswer,
      match: { id: matchId },
      isCorrect,
    });

    await this._matchRepository.update(matchId, { lastAnswer });

    const matchData = await this.getMatchDataToSend(matchId);
    this._matchGateway.sendMessageToHandlers(matchData);

    const questionsLength: number = match.questions.length;
    const usersLength: number = match.users.length;

    const [matchUserAnswers, matchUserAnswersLength] =
      await this._userAnswerRepository.findAndCount({
        where: {
          match: { id: match.id },
        },
        relations: ['user'],
      });

    if (questionsLength * usersLength === matchUserAnswersLength) {
      console.log('MATCH ENDED');
      const [firstUser, secondUser] = match.users;

      const firstUserCorrectAnswersCount = matchUserAnswers.filter(
        (answer) => answer.isCorrect && answer.user.id === firstUser.id,
      ).length;

      const secondUserCorrectAnswersCount = matchUserAnswers.filter(
        (answer) => answer.isCorrect && answer.user.id === secondUser.id,
      ).length;

      let winner: UserEntity = null;
      let looser: UserEntity = null;

      if (firstUserCorrectAnswersCount > secondUserCorrectAnswersCount) {
        winner = firstUser;
        looser = secondUser;
      } else if (firstUserCorrectAnswersCount < secondUserCorrectAnswersCount) {
        winner = secondUser;
        looser = firstUser;
      }

      await this._matchRepository.update(match.id, {
        status: MatchStatusType.ENDED,
        winner,
        looser,
      });

      if (winner) {
        if (winner.currentWinCount === winner.longestWinCount) {
          await this._userService.updateUser(winner.id, {
            longestWinCount() {
              return 'longest_win_count + 1';
            },
          });
        }
        await this._userService.updateUser(winner.id, {
          currentWinCount() {
            return 'current_win_count + 1';
          },
        });
      }

      if (looser) {
        await this._userService.updateUser(looser.id, {
          currentWinCount: 0,
        });
      }

      if (!looser && !winner) {
        await this._userService.updateUser(firstUser.id, {
          currentWinCount: 0,
        });

        await this._userService.updateUser(secondUser.id, {
          currentWinCount: 0,
        });
      }

      this._matchGateway.sendMessageToHandlers({
        ...matchData,
        status: MatchStatusType.ENDED,
        winner,
      });
    }
  }

  async getMatchDataToSend(id: number): Promise<MatchEntity> {
    const match = await this._matchRepository.findOne({
      where: { id },
      relations: [
        'users',
        'lastAnswer',
        'lastAnswer.user',
        'lastAnswer.question',
        'lastAnswer.answer',
        'nextMatch',
      ],
    });

    return match;
  }

  async findOne(userPayload: IUserId, id: number): Promise<MatchEntity> {
    const match = await this._matchRepository.findOne({
      where: { id },
      relations: [
        'users',
        'lastAnswer',
        'lastAnswer.user',
        'lastAnswer.question',
        'lastAnswer.answer',
        'users.categories',
        'questions',
        'questions.correctAnswer',
        'questions.category',
        'questions.answers',
        'userAsnwers',
        'userAsnwers.answer',
        'userAsnwers.question',
        'userAsnwers.user',
        'nextMatch',
      ],
    });

    if (!match || !match.users.some((user) => user.id === userPayload.id)) {
      throw ResponseManager.buildError(ERROR_MESSAGES.INCORRECT_MATCH_ID);
    }

    return match;
  }

  @Transactional()
  async startNewMatchWithSameOpponent(userPayload: IUserId, matchId: number) {
    const previousMatch = await this._matchRepository.findOne({
      where: { id: matchId },
      relations: ['users', 'nextMatch', 'nextMatch.users'],
    });

    if (!previousMatch) {
      throw ResponseManager.buildError(ERROR_MESSAGES.INCORRECT_MATCH_ID);
    }

    const user = previousMatch.users.find((user) => user.id === userPayload.id);

    if (!user) {
      throw ResponseManager.buildError(ERROR_MESSAGES.INCORRECT_MATCH_ID);
    }

    if (user.tickets <= 0) {
      throw ResponseManager.buildError(ERROR_MESSAGES.USER_DONT_HAVE_LIVE);
    }

    if (previousMatch.againstBot) {
      throw ResponseManager.buildError(ERROR_MESSAGES.INCORRECT_MATCH_MAKING);
    }

    if (previousMatch.status !== MatchStatusType.ENDED) {
      throw ResponseManager.buildError(ERROR_MESSAGES.PREVIOS_MATCH_NOT_ENDED);
    }

    const nextMatch = previousMatch.nextMatch;
    if (nextMatch) {
      if (nextMatch.status === MatchStatusType.CANCELED) {
        throw ResponseManager.buildError(ERROR_MESSAGES.NEXT_MATCH_CANCELED);
      }

      nextMatch.users.map((userInNextMatch) => {
        if (userInNextMatch.id === user.id) {
          throw ResponseManager.buildError(
            ERROR_MESSAGES.USER_ALREADY_IN_MATCH,
          );
        }
      });

      if (nextMatch.users.length !== 1) {
        throw ResponseManager.buildError(ERROR_MESSAGES.INCORRECT_MATCH_MAKING);
      }
      nextMatch.users.push(user);
      nextMatch.status = MatchStatusType.CATEGORY_CHOOSE;
      await this._matchRepository.save(nextMatch);
    } else {
      const users: UserEntity[] = [];
      users.push(user);
      await this._matchRepository.save({
        previousMatch: { id: previousMatch.id },
        users: users,
        status: MatchStatusType.PENDING,
      });
    }
    const previousMatchData = await this.getMatchDataToSend(previousMatch.id);
    this._matchGateway.sendMessageToHandlers(previousMatchData);
    // В которой есть инфа о next.match. и если статус category_choose- они переходят в next match ?????
  }

  @Transactional()
  async cancelRestart(userPayload: IUserId, matchId: number) {
    const previousMatch = await this._matchRepository.findOne({
      where: { id: matchId, users: { id: userPayload.id } },
      relations: ['users', 'nextMatch'],
    });

    if (!previousMatch) {
      throw ResponseManager.buildError(ERROR_MESSAGES.INCORRECT_MATCH_ID);
    } /// несколько проверак про previous match.

    if (!previousMatch.users.some((user) => user.id === userPayload.id)) {
      throw ResponseManager.buildError(ERROR_MESSAGES.INCORRECT_MATCH_ID);
    }

    if (previousMatch.againstBot) {
      throw ResponseManager.buildError(ERROR_MESSAGES.INCORRECT_MATCH_MAKING);
    }

    if (previousMatch.status !== MatchStatusType.ENDED) {
      throw ResponseManager.buildError(ERROR_MESSAGES.PREVIOS_MATCH_NOT_ENDED);
    }

    let nextMatch = previousMatch.nextMatch;
    if (nextMatch) {
      nextMatch.status = MatchStatusType.CANCELED;
      await this._matchRepository.save(nextMatch);
    } else {
      nextMatch = await this._matchRepository.save({
        previousMatch: { id: previousMatch.id },
        users: previousMatch.users,
        status: MatchStatusType.CANCELED,
      });
    }
    const previousMatchData = await this.getMatchDataToSend(matchId);
    this._matchGateway.sendMessageToHandlers(previousMatchData);
  }
}
