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
    const question = await this._questionRepository.save({
      question: body.question.trim(),
      type: body.type,
      category: { id: body.categoryId },
    });

    const languages = await this._languagesService.findAll();
    const languagesIds = languages.map((language) => language.id);

    if (languages.length !== body.translatedQuestion.length) {
      throw ResponseManager.buildError(ERROR_MESSAGES.LANGUAGE_MISSING);
    }

    const translatedQuestions = body.translatedQuestion.map(
      (translatedQuestion) => {
        if (!languagesIds.includes(translatedQuestion.languageId)) {
          throw ResponseManager.buildError(ERROR_MESSAGES.LANGUAGE_NOT_EXIST);
        }

        return this._translatedQuestionRepository.create({
          translatedQuestion: translatedQuestion.translatedQuestion,
          question: { id: question.id } as QuestionEntity,
          language: { id: translatedQuestion.languageId } as LanguageEntity,
        });
      },
    );
    await this._translatedQuestionRepository.save(translatedQuestions);

    for (const answerData of body.answers) {
      const validatedAnswer = answerData.text.trim();

      const newAnswer = await this._answerService.create({
        value: validatedAnswer,
        question: { id: question.id } as QuestionEntity,
      });

      const translatedAnswers = answerData.translatedAnswers.map(
        (translatedAnswer) => {
          if (!languagesIds.includes(translatedAnswer.languageId)) {
            throw ResponseManager.buildError(ERROR_MESSAGES.LANGUAGE_NOT_EXIST);
          }

          return this._translatedAnswersRepository.create({
            translatedAnswer: translatedAnswer.translatedAnswer,
            answer: { id: newAnswer.id } as AnswerEntity,
            language: {
              id: translatedAnswer.languageId,
            } as LanguageEntity,
          });
        },
      );

      await this._translatedAnswersRepository.save(translatedAnswers);

      if (
        validatedAnswer === body.correctAnswer.trim() ||
        body.type === QuestionType.SINGLE
      ) {
        newAnswer.value = newAnswer.value.trim();
        await this._questionRepository.update(question.id, {
          correctAnswer: newAnswer,
        });
      }
    }
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

  async findOneByQuestion(question: string): Promise<IQuestion> {
    return await this._questionRepository.findOneBy({ question });
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
          throw ResponseManager.buildError(ERROR_MESSAGES.QUESTION_NOT_EXIST);
        }
        await this._answerService.update(answerEntity, {
          value: answer.value.trim(),
        });
      }
    }

    const updateBody = omit(body, [
      'answers',
      'correctAnswer',
      'categoryId',
      'correctAnswerId',
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
      updateBody.question = updateBody.question.trim();
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
