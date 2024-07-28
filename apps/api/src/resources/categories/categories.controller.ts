import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CategoriesService } from './categories.service';
import { CategoryWithIsActiveDTO } from './dto';
import { AuthUserGuard } from '@common/guards';
import { AuthUser } from '@common/decorators';
import { TokenPayloadDTO } from '@common/dtos';
import { ResponseManager } from '@common/helpers';
import { ERROR_MESSAGES } from '@common/messages';

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
}
