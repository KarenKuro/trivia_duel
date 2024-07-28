import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';

import { CategoriesService } from './categories.service';
import { AuthUserGuard } from '@common/guards';
import { AuthUser } from '@common/decorators';
import { TokenPayloadDTO } from '@common/dtos';
import { CategoryResponseDTO } from './dto';
import { ResponseManager } from '@common/helpers';
import { ERROR_MESSAGES } from '@common/messages';

@Controller('categories')
@UseGuards(AuthUserGuard())
export class CategoriesController {
  constructor(private readonly _categoriesService: CategoriesService) {}

  @Get()
  async findAll(@AuthUser() token: TokenPayloadDTO) {
    const categories = await this._categoriesService.findAll({ id: token.id });

    return categories;
  }

  @Get('available')
  async findAllAvailible(
    @AuthUser() token: TokenPayloadDTO,
  ): Promise<CategoryResponseDTO[]> {
    const categories = await this._categoriesService.findAllAvailable({
      id: token.id,
    });

    if (!categories.length) {
      throw ResponseManager.buildError(ERROR_MESSAGES.CATEGORIES_NOT_EXISTS);
    }

    return categories;
  }

  // @Post()
  // async addAfterRegistration(@Body() body) {
  //   return this._categoriesService.create(body);
  // }

  @Put(':id')
  async add(@Param('id') id: string, @Body() body) {
    return this._categoriesService.update(+id, body);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.categoriesService.findOne(+id);
  // }
}
