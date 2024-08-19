import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
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

import { CategoriesService } from './categories.service';
import { AuthUserGuard } from '@common/guards';
import {
  CategoryResponseDTO,
  CreateCategoryDTO,
  UpdateCategoryDTO,
} from './dto';
import { ResponseManager } from '@common/helpers';
import { ERROR_MESSAGES } from '@common/messages';
import { IdDTO, PaginationQueryDTO, SuccessDTO } from '@common/dtos';
import { TokenTypes } from '@common/enums';

@Controller('categories')
@UseGuards(AuthUserGuard(TokenTypes.PRIMARY))
@ApiTags('Categories')
@ApiBearerAuth()
export class CategoriesController {
  constructor(private readonly _categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({
    status: 201,
    type: SuccessDTO,
  })
  async create(@Body() body: CreateCategoryDTO): Promise<SuccessDTO> {
    const existCategory = await this._categoriesService.findOne({
      text: body.text,
    });

    if (existCategory) {
      throw ResponseManager.buildError(ERROR_MESSAGES.CATEGORY_ALREADY_EXIST);
    }

    await this._categoriesService.create(body);
    return { success: true };
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
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
  ): Promise<CategoryResponseDTO[]> {
    const categories = await this._categoriesService.findAll(pagination);

    if (!categories.length) {
      throw ResponseManager.buildError(ERROR_MESSAGES.CATEGORIES_NOT_EXISTS);
    }
    return categories;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a category by id' })
  async findOne(@Param() param: IdDTO): Promise<CategoryResponseDTO> {
    const category = await this._categoriesService.findOne({ id: +param.id });

    if (!category) {
      throw ResponseManager.buildError(ERROR_MESSAGES.CATEGORY_NOT_EXIST);
    }

    return category;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category by id' })
  async update(
    @Param() param: IdDTO,
    @Body() body: UpdateCategoryDTO,
  ): Promise<SuccessDTO> {
    const category = await this._categoriesService.findOne({ id: +param.id });

    if (!category) {
      throw ResponseManager.buildError(ERROR_MESSAGES.CATEGORY_NOT_EXIST);
    }

    if (body.text) {
      const existCategory = await this._categoriesService.findOne({
        text: body.text,
      });
      if (existCategory && existCategory.id !== category.id) {
        throw ResponseManager.buildError(ERROR_MESSAGES.CATEGORY_ALREADY_EXIST);
      }
    }

    return await this._categoriesService.update(category, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category by id' })
  async remove(@Param() param: IdDTO): Promise<SuccessDTO> {
    const category = await this._categoriesService.findOne({ id: +param.id });

    if (!category) {
      throw ResponseManager.buildError(ERROR_MESSAGES.CATEGORY_NOT_EXIST);
    }
    return await this._categoriesService.remove(category);
  }
}
