import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';

import { CategoriesService } from './categories.service';
import { AuthUserGuard } from '@common/guards';
import { AuthUser } from '@common/decorators';
import { ITokenPayload } from '@common/models';

@Controller('categories')
@UseGuards(AuthUserGuard())
export class CategoriesController {
  constructor(private readonly _categoriesService: CategoriesService) {}

  @Get()
  async findAll(@AuthUser() token: ITokenPayload) {
    console.log(token);
  }

  @Get('avalible')
  async findAllAvalible(@AuthUser() user: ITokenPayload) {
    console.log(user);

    return;
  }

  @Post()
  async addAfterRegistration(@Body() body) {
    return this._categoriesService.create(body);
  }

  @Put(':id')
  async add(@Param('id') id: string, @Body() body) {
    return this._categoriesService.update(+id, body);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.categoriesService.findOne(+id);
  // }
}
