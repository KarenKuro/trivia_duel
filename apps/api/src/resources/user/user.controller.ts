import { Controller, Get, Post, Body, UseGuards, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CategoryResponseDTO } from '@api-resources/categories/dto';

import { AuthUser } from '@common/decorators';
import { IdDTO, SuccessDTO, TokenPayloadDTO } from '@common/dtos';
import { AuthUserGuard } from '@common/guards';
import { ResponseManager } from '@common/helpers';
import { ERROR_MESSAGES } from '@common/messages';

import { UpdateUserDTO, UserResponseDTO } from './dto';
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
    const user = await this._userService.addCategoriesAfterRegistration(
      { id: token.id },
      body,
    );

    if (!(user.categories.length === 3)) {
      throw ResponseManager.buildError(ERROR_MESSAGES.WRONG_CATEGORIES_COUNT);
    }

    const categories = await this._userService.findAllAvailableCategory({
      id: token.id,
    });
    return categories;
  }

  @Patch()
  @ApiOperation({ summary: 'Update User example:add avatar link to user ' })
  async updateUser(
    @AuthUser() token: TokenPayloadDTO,
    @Body() body: UpdateUserDTO,
  ): Promise<SuccessDTO> {
    console.log(body);

    await this._userService.updateUser(token.id, body);

    return { success: true };
  }
}
