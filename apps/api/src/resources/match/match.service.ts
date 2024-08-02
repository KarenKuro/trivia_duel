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

    if (user.tickets === 0) {
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

    const newTicketsValue = user.tickets--;
    await this._userService.updateUser(user.id, {
      tickets: newTicketsValue,
    });

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

    if (!match) {
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

      const matchData = await this.getMatchDataToSend(id);
      this._matchGateway.sendMessageToHandlers(matchData);
    }
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

    const userAnswer = body.answerId ? { id: body.answerId } : null;

    const isCorrect = userAnswer && userAnswer.id === question.correctAnswer.id;

    const lastAnswer = await this._userAnswerRepository.save({
      user: { id: userPayload.id },
      question: { id: question.id },
      answer: userAnswer,
      match: { id: matchId },
      isCorrect,
    });

    await this._matchRepository.update(matchId, {
      lastAnswer,
    });

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

    console.log('questionsLength * usersLength', questionsLength * usersLength);
    console.log('matchUserAnswersLength', matchUserAnswersLength);
    if (questionsLength * usersLength === matchUserAnswersLength) {
      console.log('MATCH ENDED');
      const [firstUser, secondUser] = match.users;

      const firstUserCorrectAnswersCount = matchUserAnswers.filter(
        (answer) => answer.isCorrect && answer.user.id === firstUser.id,
      ).length;
      console.log('firstUserCorrectAnswersCount', firstUserCorrectAnswersCount);

      const secondUserCorrectAnswersCount = matchUserAnswers.filter(
        (answer) => answer.isCorrect && answer.user.id === secondUser.id,
      ).length;
      console.log(
        'secondUserCorrectAnswersCount',
        secondUserCorrectAnswersCount,
      );

      let winner = null;

      if (firstUserCorrectAnswersCount > secondUserCorrectAnswersCount) {
        winner = { id: firstUser.id };
      } else if (firstUserCorrectAnswersCount < secondUserCorrectAnswersCount) {
        winner = { id: secondUser.id };
      }
      console.log('winner', winner);

      await this._matchRepository.update(match.id, {
        status: MatchStatusType.ENDED,
        winner,
      });

      this._matchGateway.sendMessageToHandlers({
        ...matchData,
        status: MatchStatusType.ENDED,
        winner,
      });
    }
  }

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

  async findOne(id: number): Promise<MatchEntity> {
    return this._matchRepository.findOne({
      where: { id },
      relations: [
        'users',
        'lastAnswer',
        'lastAnswer.user',
        'lastAnswer.question',
        'lastAnswer.answer',
        'questions',
        'questions.correctAnswer',
        'questions.category',
        'questions.answers',
      ],
    });
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
}
