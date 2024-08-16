import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { omit } from 'lodash';
import { Transactional } from 'typeorm-transactional';

import {
  ICategory,
  ICreateQuestion,
  IMessageSuccess,
  IPagination,
  IQuestion,
  IUpdateQuestion,
} from '@common/models';
import {
  AnswerEntity,
  LanguageEntity,
  QuestionEntity,
  TranslatedAnswerEntity,
  TranslatedQuestionEntity,
} from '@common/database/entities';
import { AnswersService } from '@admin-resources/answers';
import { QuestionType } from '@common/enums';
import { ResponseManager } from '@common/helpers';
import { ERROR_MESSAGES } from '@common/messages';
import { LanguagesService } from '@admin-resources/languages';

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
  async create(body: ICreateQuestion): Promise<IQuestion> {
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
      text: body.text.trim(),
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
      const validatedAnswer = answerData.text.trim();

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
        validatedAnswer === body.correctAnswer.trim() ||
        body.type === QuestionType.SINGLE
      ) {
        newAnswer.text = newAnswer.text.trim();
        await this._questionRepository.update(question.id, {
          correctAnswer: newAnswer,
        });
      }
    }
    await this._translatedAnswersRepository.save(allTranslatedAnswers);

    return question;
  }

  async findAll(pagination: IPagination): Promise<IQuestion[]> {
    const { offset, limit } = pagination;

    const questions = await this._questionRepository.find({
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

    return questions;
  }

  async findOne(param: Partial<IQuestion>): Promise<IQuestion> {
    const question = await this._questionRepository.findOne({
      where: param,
      relations: [
        'answers',
        'correctAnswer',
        'category',
        'translatedQuestions',
        'answers.translatedAnswers',
        'answers.translatedAnswers.language',
      ],
    });
    return question;
  }

  async findAllByCategory(param: Partial<ICategory>): Promise<IQuestion[]> {
    const questions = await this._questionRepository.find({
      where: { category: param },
      relations: [
        'answers',
        'correctAnswer',
        'category',
        'translatedQuestions',
        'answers.translatedAnswers',
      ],
    });

    return questions;
  }

  async findOneByQuestion(text: string): Promise<IQuestion> {
    return await this._questionRepository.findOneBy({ text });
  }

  @Transactional()
  async update(
    question: IQuestion,
    body: IUpdateQuestion,
  ): Promise<IMessageSuccess> {
    if (body.answers) {
      for (const answer of body.answers) {
        const answerEntity = await this._answerService.findOne(answer.id);
        if (answerEntity.question.id !== question.id) {
          throw ResponseManager.buildError(ERROR_MESSAGES.ANSWER_NOT_EXISTS);
        }
        await this._answerService.update(answerEntity, {
          text: answer.text.trim(),
        });

        for (const translatedAnswer of answer.translatedAnswers) {
          const answerTranslatedIds = answerEntity.translatedAnswers.map(
            (e) => e.id,
          );
          if (!answerTranslatedIds.includes(translatedAnswer.id)) {
            throw ResponseManager.buildError(
              ERROR_MESSAGES.ADMIN_INVALID_PASSWORD,
            );
          }
          await this._translatedAnswersRepository.update(translatedAnswer.id, {
            text: translatedAnswer.text.trim(),
          });
        }
      }
    }

    if (body.translatedQuestions) {
      const translatedIds = question.translatedQuestions.map((e) => e.id);

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
      updateBody.category = { id: body.categoryId };
    }

    const questionAnswerIds = question.answers.map((e) => e.id);

    if (body.correctAnswerId) {
      if (!questionAnswerIds.includes(body.correctAnswerId)) {
        throw ResponseManager.buildError(
          ERROR_MESSAGES.CORRECT_ANSWER_NOT_EXIST,
        );
      }
      updateBody.correctAnswer = { id: body.correctAnswerId } as AnswerEntity;
      updateBody.text = updateBody.text.trim();
    }

    await this._questionRepository.update(question.id, updateBody);

    return { success: true };
  }

  @Transactional()
  async remove(question: IQuestion): Promise<IMessageSuccess> {
    await this._questionRepository.delete(question.id);

    return { success: true };
  }
}
