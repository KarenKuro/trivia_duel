import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CategoryResponseDTO } from '@api-resources/categories/dto';

import { AuthUser } from '@common/decorators';
import { IdDTO, TokenPayloadDTO } from '@common/dtos';
import { AuthUserGuard } from '@common/guards';
import { ResponseManager } from '@common/helpers';
import { ERROR_MESSAGES } from '@common/messages';

import { UserResponseDTO } from './dto';
import { UserService } from './user.service';

@Controller('users')
@UseGuards(AuthUserGuard())
@ApiTags('Users')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly _userService: UserService) {}

  @Get('categories')
  @ApiOperation({ summary: 'Get all categories that the user has' })
  async findAllAvailibleCategories(
    @AuthUser() token: TokenPayloadDTO,
  ): Promise<CategoryResponseDTO[]> {
    const categories = await this._userService.findAllAvailableCategory({
      id: token.id,
    });

    if (!categories.length) {
      throw ResponseManager.buildError(ERROR_MESSAGES.CATEGORIES_NOT_EXISTS);
    }

    return categories;
  }

  @Get()
  @ApiOperation({ summary: 'Get User' })
  async findUser(@AuthUser() token: TokenPayloadDTO): Promise<UserResponseDTO> {
    const user = await this._userService.findOne(token.id);

    return user;
  }

  @Post('categories')
  @ApiOperation({ summary: 'Add categories after registration ' })
  async addCategoriesAfterRegistration(
    @AuthUser() token: TokenPayloadDTO,
    @Body() body: IdDTO,
  ): Promise<CategoryResponseDTO[]> {
    const categories = await this._userService.addCategoriesAfterRegistration(
      { id: token.id },
      body,
    );

    if (!(categories.length === 3)) {
      throw ResponseManager.buildError(ERROR_MESSAGES.WRONG_CATEGORIES_COUNT);
    }

    return categories;
  }
}
