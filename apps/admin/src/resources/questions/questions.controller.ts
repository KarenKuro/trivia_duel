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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CategoriesService } from '@admin-resources/categories';

import { IdDTO, PaginationQueryDTO, SuccessDTO } from '@common/dtos';
import { AuthUserGuard } from '@common/guards';
import { ResponseManager } from '@common/helpers';
import { ERROR_MESSAGES } from '@common/messages';

import { QuestionResponseDTO, UpdateQuestionDTO } from './dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { QuestionsService } from './questions.service';

@Controller('questions')
@UseGuards(AuthUserGuard())
@ApiTags('Questions')
@ApiBearerAuth()
export class QuestionsController {
  constructor(
    private readonly _questionsService: QuestionsService,
    private readonly _categoriesService: CategoriesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new question' })
  @ApiResponse({ status: 201, type: SuccessDTO })
  async create(@Body() body: CreateQuestionDto): Promise<SuccessDTO> {
    const { categoryId } = body;
    const { text } = body;

    const existingQuestion =
      await this._questionsService.findOneByQuestion(text);
    if (existingQuestion) {
      throw ResponseManager.buildError(ERROR_MESSAGES.QUESTION_ALREADY_EXIST);
    }

    const category = await this._categoriesService.findOne({ id: categoryId });
    if (!category) {
      throw ResponseManager.buildError(ERROR_MESSAGES.CATEGORIES_NOT_EXISTS);
    }

    await this._questionsService.create(body);
    return { success: true };
  }

  @Get()
  @ApiOperation({ summary: 'Get all questions' })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Number of records to skip',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of records to return',
  })
  async findAll(
    @Query() pagination: PaginationQueryDTO,
  ): Promise<QuestionResponseDTO[]> {
    return this._questionsService.findAll(pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a question by id' })
  async findOne(@Param() param: IdDTO): Promise<QuestionResponseDTO> {
    const question = this._questionsService.findOne({ id: +param.id });

    if (!question) {
      throw ResponseManager.buildError(ERROR_MESSAGES.QUESTION_NOT_EXIST);
    }

    return question;
  }

  @Get('category/:id')
  @ApiOperation({ summary: 'Get all questions by category id' })
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
  @ApiOperation({ summary: 'Update a question by id' })
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
      body.text,
    );
    if (existQuestion && existQuestion.id !== question.id) {
      throw ResponseManager.buildError(ERROR_MESSAGES.QUESTION_ALREADY_EXIST);
    }

    return await this._questionsService.update(question, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a question by id' })
  async remove(@Param() param: IdDTO): Promise<SuccessDTO> {
    const question = await this._questionsService.findOne({ id: +param.id });

    if (!question) {
      throw ResponseManager.buildError(ERROR_MESSAGES.QUESTION_NOT_EXIST);
    }
    return await this._questionsService.remove(question);
  }
}
