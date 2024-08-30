import { Controller, Get, Post, Body, UseGuards, Patch } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { plainToInstance } from 'class-transformer';

import { CategoryResponseDTO } from '@api-resources/categories/dto';
import { MatchDataToSendInSocketDTO } from '@api-resources/match/dto';

import { AuthUser, Language } from '@common/decorators';
import {
  CategoryResponseWithoutTranslationsDTO,
  IdDTO,
  MatchUserResponseDTO,
  SuccessDTO,
  TokenPayloadDTO,
} from '@common/dtos';
import { AuthUserGuard } from '@common/guards';
import { ResponseManager } from '@common/helpers';
import { ERROR_MESSAGES } from '@common/messages';

import { UpdateUserDTO, UserResponseDTO, LeaderBoardUserDataDTO } from './dto';
import { UserService } from './user.service';

@Controller('users')
@UseGuards(AuthUserGuard())
@ApiTags('Users')
@ApiBearerAuth()
@ApiHeader({
  name: 'x-language',
  example: { name: 'x-language', value: 'arm' },
})
export class UserController {
  constructor(private readonly _userService: UserService) {}

  @Get('categories')
  @ApiOperation({ summary: 'Get all categories that the user has' })
  async findAllAvailibleCategories(
    @AuthUser() token: TokenPayloadDTO,
    @Language() language: string,
  ): Promise<CategoryResponseDTO[]> {
    const categories = await this._userService.findAllAvailableCategory(
      { id: token.id },
      language,
    );

    if (!categories.length) {
      throw ResponseManager.buildError(ERROR_MESSAGES.CATEGORIES_NOT_EXISTS);
    }

    return plainToInstance(CategoryResponseWithoutTranslationsDTO, categories, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get User' })
  async findUser(
    @AuthUser() token: TokenPayloadDTO,
    @Language() language: string,
  ): Promise<UserResponseDTO> {
    const user = await this._userService.findOne(token.id, language);

    return plainToInstance(UserResponseDTO, user, {
      excludeExtraneousValues: true,
    });
  }

  @Post('categories')
  @ApiOperation({ summary: 'Add categories after registration ' })
  async addCategoriesAfterRegistration(
    @AuthUser() token: TokenPayloadDTO,
    @Body() body: IdDTO,
    @Language() language: string,
  ): Promise<SuccessDTO> {
    const user = await this._userService.addCategoriesAfterRegistration(
      { id: token.id },
      body,
      language,
    );

    if (!(user.categories.length === 3)) {
      throw ResponseManager.buildError(ERROR_MESSAGES.WRONG_CATEGORIES_COUNT);
    }

    return { success: true };
  }

  @Patch()
  @ApiOperation({
    summary: 'Update User example:add avatar link to user , tickets or name',
  })
  async updateUser(
    @AuthUser() token: TokenPayloadDTO,
    @Body() body: UpdateUserDTO,
  ): Promise<SuccessDTO> {
    await this._userService.updateUser(token.id, body);

    return { success: true };
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Return Leader Board' })
  async getLeaderboard(
    @AuthUser() token: TokenPayloadDTO,
  ): Promise<LeaderBoardUserDataDTO[]> {
    return await this._userService.getLeaderboard(token.id);
  }

  @Post('websocket-dto')
  @ApiOperation({
    summary: 'For WS documentation. MatchData. Event: message',
    description:
      'Attention! The winner field of the object will exist only when the match is in the status "ENDED"',
  })
  documentWebSocketDTO(@Body() dto: MatchDataToSendInSocketDTO): void {
    // Этот метод никогда не будет вызываться, он служит только для документации
    console.log(dto);
  }

  @Patch('websocket-dto')
  @ApiOperation({
    summary: 'For WS documentation. UserData. Event: user',
  })
  documentWebSocketUserDTO(@Body() dto: MatchUserResponseDTO): void {
    // Этот метод никогда не будет вызываться, он служит только для документации
    console.log(dto);
  }
}
