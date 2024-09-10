import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { omit } from 'lodash';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

import { AnswersService } from '@admin-resources/answers';
import { LanguagesService } from '@admin-resources/languages';

import {
  AnswerEntity,
  CategoryEntity,
  LanguageEntity,
  QuestionEntity,
  TranslatedAnswerEntity,
  TranslatedQuestionEntity,
} from '@common/database/entities';
import { QuestionType } from '@common/enums';
import { ResponseManager } from '@common/helpers';
import { ERROR_MESSAGES } from '@common/messages';
import {
  ICategory,
  ICreateQuestion,
  IMessageSuccess,
  IPagination,
  IQuestion,
  IUpdateQuestion,
} from '@common/models';

@Injectable()
export class QuestionsService {
  constructor(
    private readonly _answerService: AnswersService,

    @InjectRepository(QuestionEntity)
    private readonly _questionRepository: Repository<QuestionEntity>,

    @InjectRepository(TranslatedQuestionEntity)
    private readonly _translatedQuestionRepository: Repository<TranslatedQuestionEntity>,

    @InjectRepository(TranslatedAnswerEntity)
    private readonly _translatedAnswersRepository: Repository<TranslatedAnswerEntity>,

    private readonly _languagesService: LanguagesService,
  ) {}

  @Transactional()
  async create(body: ICreateQuestion): Promise<void> {
    const languages = await this._languagesService.findAll();

    if (languages.length !== body.translatedQuestion.length) {
      throw ResponseManager.buildError(ERROR_MESSAGES.LANGUAGE_MISSING);
    }

    const languagesIds = languages.map((language) => language.id);

    const translatedQuestionIds = body.translatedQuestion.map(
      (el) => el.languageId,
    );
    const languagesIdsSet = new Set(translatedQuestionIds);
    if (translatedQuestionIds.length !== languagesIdsSet.size) {
      throw ResponseManager.buildError(ERROR_MESSAGES.LANGUAGE_ALREADY_EXIST);
    }

    const question = await this._questionRepository.save({
      text: body.text,
      type: body.type,
      category: { id: body.categoryId },
    });

    const translatedQuestions = body.translatedQuestion.map(
      (translatedQuestion) => {
        if (!languagesIds.includes(translatedQuestion.languageId)) {
          throw ResponseManager.buildError(ERROR_MESSAGES.LANGUAGE_NOT_EXIST);
        }

        return this._translatedQuestionRepository.create({
          text: translatedQuestion.text,
          question: { id: question.id } as QuestionEntity,
          language: { id: translatedQuestion.languageId } as LanguageEntity,
        });
      },
    );
    await this._translatedQuestionRepository.save(translatedQuestions);

    const allTranslatedAnswers: TranslatedAnswerEntity[] = [];
    for (const answerData of body.answers) {
      const validatedAnswer = answerData.text;

      const newAnswer = await this._answerService.create({
        text: validatedAnswer,
        question: { id: question.id } as QuestionEntity,
      });

      const translatedAnswers = answerData.translatedAnswers.map(
        (translatedAnswer) => {
          if (!languagesIds.includes(translatedAnswer.languageId)) {
            throw ResponseManager.buildError(ERROR_MESSAGES.LANGUAGE_NOT_EXIST);
          }

          return this._translatedAnswersRepository.create({
            text: translatedAnswer.text,
            answer: { id: newAnswer.id } as AnswerEntity,
            language: {
              id: translatedAnswer.languageId,
            } as LanguageEntity,
          });
        },
      );

      const translatedAnswersIds = translatedAnswers.map(
        (el) => el.language.id,
      );
      const languagesIdsSet = new Set(translatedAnswersIds);
      if (translatedAnswersIds.length !== languagesIdsSet.size) {
        throw ResponseManager.buildError(ERROR_MESSAGES.LANGUAGE_ALREADY_EXIST);
      }

      allTranslatedAnswers.push(...translatedAnswers);

      if (
        validatedAnswer === body.correctAnswer ||
        body.type === QuestionType.SINGLE
      ) {
        await this._questionRepository.update(question.id, {
          correctAnswer: newAnswer,
        });
      }
    }
    await this._translatedAnswersRepository.save(allTranslatedAnswers);
  }

  async findAll(pagination: IPagination): Promise<[IQuestion[], number]> {
    const { offset, limit } = pagination;

    const [questions, count] = await this._questionRepository.findAndCount({
      relations: [
        'answers',
        'correctAnswer',
        'category',
        'category.image',
        'translatedQuestions',
        'answers.translatedAnswers',
        'answers.translatedAnswers.language',
      ],
      skip: +offset,
      take: +limit,
    });

    return [questions, count];
  }

  async findOne(param: Partial<IQuestion>): Promise<IQuestion> {
    const question = await this._questionRepository.findOne({
      where: param,
      relations: [
        'answers',
        'correctAnswer',
        'category',
        'category.image',
        'translatedQuestions',
        'translatedQuestions.language',
        'answers.translatedAnswers',
        'answers.translatedAnswers.language',
      ],
    });
    return question;
  }

  async findAllByCategory(
    param: Partial<ICategory>,
    pagination: IPagination,
  ): Promise<[IQuestion[], number]> {
    const { offset, limit } = pagination;

    const [questions, count] = await this._questionRepository.findAndCount({
      where: { category: param },
      relations: [
        'answers',
        'correctAnswer',
        'category',
        'translatedQuestions',
        'answers.translatedAnswers',
        'answers.translatedAnswers.language',
      ],
      skip: +offset,
      take: +limit,
    });

    return [questions, count];
  }

  async findOneByQuestion(text: string): Promise<IQuestion> {
    return await this._questionRepository.findOneBy({ text });
  }

  @Transactional()
  async update(
    question: IQuestion,
    body: IUpdateQuestion,
  ): Promise<IMessageSuccess> {
    const questionAnswerIds = question.answers.map((e) => e.id);

    // Validate and Update Answers
    if (body.answers) {
      const bodyAnswersIds = body.answers.map((e) => e.id);
      const uniqueBodyAnswersIds = new Set([...bodyAnswersIds]);
      if (bodyAnswersIds.length !== uniqueBodyAnswersIds.size) {
        throw ResponseManager.buildError(ERROR_MESSAGES.ANSWERS_NOT_UNIQUE);
      }
      // Validate answers and translated answers
      for (const id of bodyAnswersIds) {
        if (!questionAnswerIds.includes(id)) {
          throw ResponseManager.buildError(ERROR_MESSAGES.ANSWER_NOT_EXISTS);
        }
      }

      for (const answer of body.answers) {
        const answerEntity = await this._answerService.findOne(answer.id);
        if (answerEntity.question.id !== question.id) {
          throw ResponseManager.buildError(ERROR_MESSAGES.ANSWER_NOT_EXISTS);
        }
        await this._answerService.update(answerEntity, {
          text: answer.text,
        });

        if (answer.translatedAnswers) {
          for (const translatedAnswer of answer.translatedAnswers) {
            const answerTranslatedIds = answerEntity.translatedAnswers.map(
              (e) => e.id,
            );

            if (!answerTranslatedIds.includes(translatedAnswer.id)) {
              throw ResponseManager.buildError(
                ERROR_MESSAGES.TRANSLATED_ANSWER_NOT_EXISTS,
              );
            }

            const bodyTranslatedAnswersIds = answer.translatedAnswers.map(
              (e) => e.id,
            );
            const uniqueAnswerTranslatedIds = new Set([
              ...bodyTranslatedAnswersIds,
            ]);
            if (
              bodyTranslatedAnswersIds.length !== uniqueAnswerTranslatedIds.size
            ) {
              throw ResponseManager.buildError(
                ERROR_MESSAGES.TRANSLATED_ANSWERS_NOT_UNIQUE,
              );
            }

            await this._translatedAnswersRepository.update(
              translatedAnswer.id,
              {
                text: translatedAnswer.text,
              },
            );
          }
        }
      }
    }

    // Validate and Update translated questions
    if (body.translatedQuestions) {
      const translatedIds = question.translatedQuestions.map((e) => e.id);
      const bodyTranslatedIds = body.translatedQuestions.map((e) => e.id);
      const uniqTranslatedIds = new Set([...bodyTranslatedIds]);
      if (bodyTranslatedIds.length !== uniqTranslatedIds.size) {
        throw ResponseManager.buildError(
          ERROR_MESSAGES.TRANSLATED_QUESTIONS_NOT_UNIQUE,
        );
      }

      for (const translatedQuestion of body.translatedQuestions) {
        if (!translatedIds.includes(translatedQuestion.id)) {
          throw ResponseManager.buildError(
            ERROR_MESSAGES.TRANSLATED_CATEGORY_NOT_EXIST,
          );
        }

        await this._translatedQuestionRepository.update(
          translatedQuestion.id,
          translatedQuestion,
        );
      }
    }

    const updateBody = omit(body, [
      'answers',
      'categoryId',
      'correctAnswerId',
      'translatedQuestions',
    ]) as IQuestion;

    if (body.categoryId) {
      updateBody.category = { id: body.categoryId } as CategoryEntity;
    }

    if (body.correctAnswerId) {
      if (!questionAnswerIds.includes(body.correctAnswerId)) {
        throw ResponseManager.buildError(
          ERROR_MESSAGES.CORRECT_ANSWER_NOT_EXIST,
        );
      }
      updateBody.correctAnswer = { id: body.correctAnswerId } as AnswerEntity;
    }

    await this._questionRepository.update(question.id, updateBody);

    return { success: true };
  }

  @Transactional()
  async remove(question: IQuestion): Promise<IMessageSuccess> {
    await this._questionRepository.softDelete(question.id);

    return { success: true };
  }
}
