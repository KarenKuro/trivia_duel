import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Patch,
  Delete,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CategoriesService } from '@admin-resources/categories';
import { ResponseManager } from '@common/helpers';
import { ERROR_MESSAGES } from '@common/messages';
import { IdDTO, PaginationQueryDTO, SuccessDTO } from '@common/dtos';
import { QuestionResponseDTO, UpdateQuestionDTO } from './dto';
import { AuthUserGuard } from '@common/guards';

@Controller('questions')
@UseGuards(AuthUserGuard())
export class QuestionsController {
  constructor(
    private readonly _questionsService: QuestionsService,
    private readonly _categoriesService: CategoriesService,
  ) {}

  @Post()
  async create(@Body() body: CreateQuestionDto): Promise<QuestionResponseDTO> {
    const { categoryId } = body;
    const { question: wordingOfQuestion } = body;

    const existingQuest = await this._questionsService.findOneByQuestion(
      wordingOfQuestion.trim(),
    );
    if (existingQuest) {
      throw ResponseManager.buildError(ERROR_MESSAGES.QUESTION_ALREADY_EXIST);
    }

    const category = await this._categoriesService.findOne({ id: categoryId });
    if (!category) {
      throw ResponseManager.buildError(ERROR_MESSAGES.CATEGORIES_NOT_EXISTS);
    }

    const question = await this._questionsService.create(body);
    return question;
  }

  @Get()
  async findAll(
    @Query() pagination: PaginationQueryDTO,
  ): Promise<QuestionResponseDTO[]> {
    return this._questionsService.findAll(pagination);
  }

  @Get(':id')
  async findOne(@Param() param: IdDTO): Promise<QuestionResponseDTO> {
    const question = this._questionsService.findOne({ id: +param.id });

    if (!question) {
      throw ResponseManager.buildError(ERROR_MESSAGES.QUESTION_NOT_EXIST);
    }

    return question;
  }

  @Get('category/:id')
  async findAllByCategory(
    @Param() param: IdDTO,
  ): Promise<QuestionResponseDTO[]> {
    const category = await this._categoriesService.findOne({ id: +param.id });
    if (!category) {
      throw ResponseManager.buildError(ERROR_MESSAGES.CATEGORY_NOT_EXIST);
    }

    const questions = await this._questionsService.findAllByCategory({
      id: +param.id,
    });

    if (!questions.length) {
      throw ResponseManager.buildError(ERROR_MESSAGES.QUESTIONS_NOT_EXISTS);
    }

    return questions;
  }

  @Patch(':id')
  async update(
    @Param() param: IdDTO,
    @Body() body: UpdateQuestionDTO,
  ): Promise<SuccessDTO> {
    const question = await this._questionsService.findOne({ id: +param.id });

    if (!question) {
      throw ResponseManager.buildError(ERROR_MESSAGES.QUESTION_NOT_EXIST);
    }

    if (body.categoryId) {
      const category = await this._categoriesService.findOne({
        id: body.categoryId,
      });
      if (!category) {
        throw ResponseManager.buildError(ERROR_MESSAGES.CATEGORIES_NOT_EXISTS);
      }
    }

    const existQuestion = await this._questionsService.findOneByQuestion(
      body.question.trim(),
    );
    if (existQuestion && existQuestion.id !== question.id) {
      throw ResponseManager.buildError(ERROR_MESSAGES.QUESTION_ALREADY_EXIST);
    }

    return await this._questionsService.update(question, body);
  }

  @Delete(':id')
  async remove(@Param() param: IdDTO): Promise<SuccessDTO> {
    const question = await this._questionsService.findOne({ id: +param.id });

    if (!question) {
      throw ResponseManager.buildError(ERROR_MESSAGES.QUESTION_NOT_EXIST);
    }
    return await this._questionsService.remove(question);
  }
}
