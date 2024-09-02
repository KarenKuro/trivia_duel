import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { plainToInstance } from 'class-transformer';

import { AuthUser, Language } from '@common/decorators';
import { IdDTO, SuccessDTO, TokenPayloadDTO } from '@common/dtos';
import { AuthUserGuard } from '@common/guards';
import { ResponseManager } from '@common/helpers';
import { ERROR_MESSAGES } from '@common/messages';

import {
  CategoriesDTO,
  MatchResponseDTO,
  MatchStartResponseDTO,
  UserAnswerDTO,
} from './dto';
import { MatchService } from './match.service';

@Controller('matches')
@UseGuards(AuthUserGuard())
@ApiTags('Matches')
@ApiBearerAuth()
@ApiHeader({
  name: 'x-language',
  example: { name: 'x-language', value: 'eng' },
})
export class MatchController {
  constructor(private readonly _matchService: MatchService) {}

  @Post('start')
  @ApiOperation({
    summary: 'Join to match, if can find, or not - create new match',
  })
  @ApiResponse({ type: MatchStartResponseDTO, status: 201 })
  async createMatch(
    @AuthUser() token: TokenPayloadDTO,
    @Language() language: string,
  ): Promise<MatchStartResponseDTO> {
    const match = await this._matchService.createOrJoinMatch(token, language);
    if (!match) {
      throw ResponseManager.buildError(ERROR_MESSAGES.INCORRECT_MATCH_MAKING);
    }

    const matchStartResponse = {
      id: match.id,
      status: match.status,
    } as MatchStartResponseDTO;

    return matchStartResponse as MatchStartResponseDTO;
  }

  // categorynery kawelnan matchi mej // hamadzayn categoryi questionnery kkpnin matchin // u statusy kpoxe
  @Post(':id/categories')
  @ApiOperation({ summary: 'Add categories and questions in match' })
  @ApiParam({ name: 'id', description: 'Match Id' })
  async selectCategories(
    @Param() match: IdDTO,
    @Body() body: CategoriesDTO,
    @AuthUser() userPayload: TokenPayloadDTO,
  ): Promise<SuccessDTO> {
    await this._matchService.selectCategories(+match.id, body, userPayload);

    return { success: true };
  }

  // Matchi datan get kexni, neraryal, questionnery, usernery yew amen inch
  @Get(':id')
  @ApiOperation({ summary: 'Get Match data by Match Id' })
  @ApiParam({ name: 'id', description: 'Match Id' })
  async get(
    @Param() param: IdDTO,
    @AuthUser() user: TokenPayloadDTO,
    @Language() language: string,
  ): Promise<MatchResponseDTO> {
    const match = await this._matchService.findOne(user, +param.id, language); /// user statistic.

    return plainToInstance(MatchResponseDTO, match, {
      excludeExtraneousValues: true,
    });
  }

  @Post(':id/answer')
  @ApiOperation({ summary: 'Add answer to match questions' })
  @ApiParam({ name: 'id', description: 'Match Id' })
  @ApiResponse({ type: SuccessDTO })
  async asnwer(
    @AuthUser() user: TokenPayloadDTO,
    @Param() match: IdDTO,
    @Body() body: UserAnswerDTO,
  ) {
    await this._matchService.answer(user, +match.id, body);

    return { success: true };
  }

  @Post(':id/restart')
  @ApiOperation({ summary: 'Restart match' })
  @ApiParam({ name: 'id', description: 'Match Id' })
  @ApiResponse({ type: SuccessDTO })
  async restart(@AuthUser() user: TokenPayloadDTO, @Param() match: IdDTO) {
    await this._matchService.startNewMatchWithSameOpponent(user, +match.id);

    return { success: true };
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Match restart cancellation' })
  @ApiParam({ name: 'id', description: 'Match Id' })
  @ApiResponse({ type: SuccessDTO })
  async cancelRestart(
    @AuthUser() user: TokenPayloadDTO,
    @Param() match: IdDTO,
  ) {
    await this._matchService.cancelRestart(user, +match.id);

    return { success: true };
  }
}
