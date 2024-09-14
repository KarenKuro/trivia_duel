import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { MAIN_LANGUAGE } from '@common/constants';
import { AuthUser, Language } from '@common/decorators';
import { SuccessDTO, TokenPayloadDTO } from '@common/dtos';
import { AuthUserGuard } from '@common/guards';
import { ResponseManager } from '@common/helpers';
import { ERROR_MESSAGES } from '@common/messages';
import { LANGUAGES } from '@common/sets';

import { CategoriesService } from './categories.service';
import { BuyCategoryDTO, CategoryWithIsActiveDTO } from './dto';

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
    @Language() language: string,
  ): Promise<CategoryWithIsActiveDTO[]> {
    if (!LANGUAGES.has(language)) {
      language = MAIN_LANGUAGE;
    }

    const categories = await this._categoriesService.findAllWithIsActive(
      {
        id: token.id,
      },
      language,
    );

    if (!categories.length) {
      throw ResponseManager.buildError(ERROR_MESSAGES.CATEGORIES_NOT_EXISTS);
    }

    return categories;
  }

  @Post('buy')
  @ApiOperation({ summary: 'Buy category' })
  @ApiResponse({ status: 201, type: SuccessDTO })
  async buyCategory(
    @AuthUser() token: TokenPayloadDTO,
    @Body() body: BuyCategoryDTO,
  ): Promise<SuccessDTO> {
    await this._categoriesService.addCategory(token, body);

    return { success: true };
  }
}
