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

@UseGuards(AuthUserGuard())
@Controller('categories')
export class CategoriesController {
  constructor(private readonly _categoriesService: CategoriesService) {}

  @Post()
  async create(@Body() body: CreateCategoryDTO): Promise<CategoryResponseDTO> {
    const existCategory = await this._categoriesService.findOne({
      name: body.name,
    });

    if (existCategory) {
      throw ResponseManager.buildError(ERROR_MESSAGES.CATEGORY_ALREADY_EXIST);
    }

    const category = await this._categoriesService.create(body);
    return category;
  }

  @Get()
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
  async findOne(@Param() param: IdDTO): Promise<CategoryResponseDTO> {
    const category = await this._categoriesService.findOne({ id: +param.id });

    if (!category) {
      throw ResponseManager.buildError(ERROR_MESSAGES.CATEGORY_NOT_EXIST);
    }

    return category;
  }

  @Patch(':id')
  async update(
    @Param() param: IdDTO,
    @Body() body: UpdateCategoryDTO,
  ): Promise<SuccessDTO> {
    const category = await this._categoriesService.findOne({ id: +param.id });

    if (!category) {
      throw ResponseManager.buildError(ERROR_MESSAGES.CATEGORY_NOT_EXIST);
    }

    if (body.name) {
      const existCategory = await this._categoriesService.findOne({
        name: body.name,
      });
      if (existCategory && existCategory.id !== category.id) {
        throw ResponseManager.buildError(ERROR_MESSAGES.CATEGORY_ALREADY_EXIST);
      }
    }

    return await this._categoriesService.update(category, body);
  }

  @Delete(':id')
  async remove(@Param() param: IdDTO): Promise<SuccessDTO> {
    const category = await this._categoriesService.findOne({ id: +param.id });

    if (!category) {
      throw ResponseManager.buildError(ERROR_MESSAGES.CATEGORY_NOT_EXIST);
    }
    return await this._categoriesService.remove(category);
  }
}
