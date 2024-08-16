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

import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CategoriesService } from '@admin-resources/categories';
import { ResponseManager } from '@common/helpers';
import { ERROR_MESSAGES } from '@common/messages';
import { IdDTO, PaginationQueryDTO, SuccessDTO } from '@common/dtos';
import { AuthUserGuard } from '@common/guards';
import { QuestionResponseDTO, UpdateQuestionDTO } from './dto';

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
  @ApiResponse({
    status: 201,
    description: 'Return created question',
    type: QuestionResponseDTO,
  })
  async create(@Body() body: CreateQuestionDto): Promise<QuestionResponseDTO> {
    const { categoryId } = body;
    const { text } = body;

    const existingQuestion = await this._questionsService.findOneByQuestion(
      text.trim(),
    );
    if (existingQuestion) {
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
      body.text.trim(),
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
