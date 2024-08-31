import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';

import { In, Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

import { CategoriesService } from '@api-resources/categories';
import { UserService } from '@api-resources/user';
import { DbManagerService } from '@shared/db-manager';

import {
  MAIN_LANGUAGE,
  MATCH_CATEGORIES_MAX_LENGTH,
  MATCH_USER_CATEGORIES_MAX_LENGTH,
} from '@common/constants';
import {
  CategoryEntity,
  MatchCategoryEntity,
  MatchEntity,
  QuestionEntity,
  UserAnswerEntity,
  UserEntity,
} from '@common/database/entities';
import { MatchLevel, MatchStatusType, QuestionType } from '@common/enums';
import { MatchHelpers, ResponseManager } from '@common/helpers';
import { ERROR_MESSAGES } from '@common/messages';
import {
  ICategories,
  ICategory,
  IId,
  IUserAnswer,
  IUserId,
} from '@common/models';

import { MatchGateway } from './match.gateway';

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

    private readonly _dbManagerService: DbManagerService,

    private readonly _eventEmitter: EventEmitter2,
  ) {}

  @Transactional()
  async createOrJoinMatch(
    userPayload: IUserId,
    language: string,
  ): Promise<MatchEntity> {
    const user = await this._userService.findOne(userPayload.id, language);

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

    return newMatch; // TODO: Крон джоб, или event чтобы юзер не ждал больше 10 секунд и подключался бот
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
        throw ResponseManager.buildError(
          ERROR_MESSAGES.USER_CATEGORIES_NOT_EXISTS,
        );
      }
    });

    const matchCategoryIds: number[] = match.categories.map(
      (matchCategory) => matchCategory.category.id,
    );

    // TODO: здесь нужно добавить две случайные категории от бота или если юзер вышел, и остался один юзер, подключился бот!!!!!!!!!!!!

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
      match.questions = questions;
      match.status = MatchStatusType.IN_PROCESS;

      const currTime = await this._dbManagerService.getTime();

      match.startedAt = currTime;
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

    const rawData = await this._dbManagerService.runQuery<IId[]>(queryString);

    const questionIds = rawData.map((raw) => Number(raw.id));

    const questions = await this._questionRepository.find({
      where: {
        id: In(questionIds),
      },
    });

    return questions;
  }

  @Transactional()
  async answer(
    userPayload: IUserId,
    matchId: number,
    body: IUserAnswer,
  ): Promise<void> {
    const match = await this._matchRepository.findOne({
      where: { id: matchId, status: MatchStatusType.IN_PROCESS },
      relations: [
        'users',
        'users.statistics',
        'questions',
        'questions.correctAnswer',
        'questions.answers',
      ],
    });

    // TODO: написать функцию, если against bot - true

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
        (item) => item.text.trim().toLowerCase() === validatedBodyAnswer,
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
      await this.finishMatchWithRealOpponent(match, matchUserAnswers);
    }
  }

  async finishMatchWithRealOpponent(
    match: MatchEntity,
    matchUserAnswers: UserAnswerEntity[],
  ): Promise<void> {
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

    await this.updateStatistics(winner, looser, [firstUser, secondUser]);

    const matchData = await this.getMatchDataToSend(match.id);

    this._matchGateway.sendMessageToHandlers({
      ...matchData,
      status: MatchStatusType.ENDED,
      winner,
    });

    // TODO add user points and levelup
    // this._userService.addPoints(users, matchData);

    // add tiket, after 15 minutes, when match ended
    this._eventEmitter.emit('task.trigger', match.users);
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

  async findOne(
    userPayload: IUserId,
    id: number,
    language: string,
  ): Promise<MatchEntity> {
    const match = await this._matchRepository.findOne({
      where: { id },
      relations: [
        'users',
        'users.statistics',
        'questions',
        'questions.translatedQuestions',
        'questions.translatedQuestions.language',
        'questions.correctAnswer',
        'questions.correctAnswer.translatedAnswers',
        'questions.correctAnswer.translatedAnswers.language',
        'questions.category',
        'questions.category.translatedCategories',
        'questions.category.translatedCategories.language',
        'questions.category.image',
        'questions.answers',
        'questions.answers.translatedAnswers',
        'questions.answers.translatedAnswers.language',
        'userAsnwers',
        'userAsnwers.answer',
        'userAsnwers.question',
        'userAsnwers.user',
        'userAsnwers.match',
        'categories',
        'categories.user',
        'categories.category',
        'categories.category.translatedCategories',
        'categories.category.translatedCategories.language',
        'categories.category.image',
        'categories.match',
        'nextMatch',
        'previousMatch',
        'winner',
        'looser',
      ],
    });

    if (!match || !match.users.some((user) => user.id === userPayload.id)) {
      throw ResponseManager.buildError(ERROR_MESSAGES.INCORRECT_MATCH_ID);
    }

    const matchData = this.prepareDataInRequiredLanguage(match, language);

    return matchData;
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
      throw ResponseManager.buildError(
        ERROR_MESSAGES.PREVIOUS_MATCH_AGAINST_BOT,
      );
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
    // В которой есть инфа о next.match. и если статус category_choose- они переходят в next match
  }

  @Transactional()
  async cancelRestart(userPayload: IUserId, matchId: number) {
    const previousMatch = await this._matchRepository.findOne({
      where: { id: matchId, users: { id: userPayload.id } },
      relations: ['users', 'nextMatch'],
    });

    if (!previousMatch) {
      throw ResponseManager.buildError(ERROR_MESSAGES.INCORRECT_MATCH_ID);
    }

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

  prepareDataInRequiredLanguage(
    match: MatchEntity,
    language: string,
  ): MatchEntity {
    if (language !== MAIN_LANGUAGE) {
      match.categories = match.categories.map((matchCategory) => {
        const category = matchCategory.category;
        const translatedCategory = category.translatedCategories.find(
          (translatedCategory) => translatedCategory.language.key === language,
        );

        matchCategory.category.text = translatedCategory.text;
        return matchCategory;
      });

      match.questions = match.questions.map((matchQuestion) => {
        const translatedQuestion = matchQuestion.translatedQuestions.find(
          (translatedQuestion) => translatedQuestion.language.key === language,
        );
        matchQuestion.text = translatedQuestion.text;

        const translatedCategory =
          matchQuestion.category.translatedCategories.find(
            (translatedCategory) =>
              translatedCategory.language.key === language,
          );

        const translatedAnswers = matchQuestion.answers.map((answer) => {
          const translatedAnswer = answer.translatedAnswers.find(
            (translatedAnsw) => translatedAnsw.language.key === language,
          );
          answer.text = translatedAnswer.text;
          return answer;
        });

        matchQuestion.category.text = translatedCategory.text;
        matchQuestion.answers = translatedAnswers;
        return matchQuestion;
      });
    }
    return match;
  }

  async updateStatistics(
    winner: UserEntity,
    looser: UserEntity,
    users: UserEntity[],
  ) {
    if (winner) {
      const winnerStat = winner.statistics;

      if (winnerStat.currentWinCount === winnerStat.longestWinCount) {
        winnerStat.longestWinCount += 1;
      }

      winnerStat.currentWinCount += 1;
      winnerStat.victories += 1;

      await this._userService.updateStatistics(winnerStat.id, winnerStat);
    }

    if (looser) {
      const looserStat = looser.statistics;
      looserStat.currentWinCount = 0;
      looserStat.defeats += 1;
      await this._userService.updateStatistics(looserStat.id, looserStat);
    }

    if (!looser && !winner) {
      for (const user of users) {
        const userStat = user.statistics;

        userStat.currentWinCount = 0;
        userStat.draws += 1;
        await this._userService.updateStatistics(userStat.id, userStat);
      }
    }
  }

  async bonusesBasedOnMatchResults() {}
}
