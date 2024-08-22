import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthUser } from '@common/decorators';
import { TokenPayloadDTO } from '@common/dtos';
import { AuthUserGuard } from '@common/guards';
import { ResponseManager } from '@common/helpers';
import { ERROR_MESSAGES } from '@common/messages';

import { CategoriesService } from './categories.service';
import {
  BuyCategoryDTO,
  CategoryResponseDTO,
  CategoryWithIsActiveDTO,
} from './dto';

@Controller('categories')
@UseGuards(AuthUserGuard())
@ApiTags('Categories')
@ApiBearerAuth()
export class CategoriesController {
  constructor(private readonly _categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories with the isActive field' })
  async findAllWithIsActive(
    @AuthUser() token: TokenPayloadDTO,
  ): Promise<CategoryWithIsActiveDTO[]> {
    const categories = await this._categoriesService.findAllWithIsActive({
      id: token.id,
    });

    if (!categories.length) {
      throw ResponseManager.buildError(ERROR_MESSAGES.CATEGORIES_NOT_EXISTS);
    }

    return categories;
  }

  @Post('buy')
  @ApiOperation({ summary: 'Buy category' })
  @ApiResponse({ status: 201 })
  async buyCategory(
    @AuthUser() token: TokenPayloadDTO,
    @Body() body: BuyCategoryDTO,
  ): Promise<CategoryResponseDTO> {
    const category = await this._categoriesService.addCategory(token, body);

    return category;
  }

  
}
