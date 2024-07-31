import { AuthUser } from '@common/decorators';
import { IdDTO, TokenPayloadDTO } from '@common/dtos';
import { ITokenPayload } from '@common/models';
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { MatchService } from './match.service';
import { AuthUserGuard } from '@common/guards';
import { MatchResponseDTO } from './dto';
import { ResponseManager } from '@common/helpers';
import { ERROR_MESSAGES } from '@common/messages';

@Controller('match')
@UseGuards(AuthUserGuard())
export class MatchController {
  constructor(private readonly _matchService: MatchService) {}

  @Post('start')
  async createMatch(
    @AuthUser() token: TokenPayloadDTO,
  ): Promise<MatchResponseDTO> {
    const match = await this._matchService.createOrJoinMatch(token);
    if (!match) {
      throw ResponseManager.buildError(ERROR_MESSAGES.INCORRECT_MATCH_MAKING);
    }

    return match;
  }

  @Post(':id/categories')
  async selectCategories(@Param() param: IdDTO) {
    // categorynery kawelnan matchi mej // hamadzayn categoryi questionnery kkpnin matchin // u statusy kpoxe
  }

  @Get(':id')
  async get(@Param() param: IdDTO) {
    // Matchi datan get kexni, neraryal, questionnery, usernery yew amen inch
  }

  @Post(':id/answer')
  async asnwer(
    @Param() param: IdDTO,
    @AuthUser() user: ITokenPayload,
    @Body() body: any,
  ) {
    await this._matchService.answer(+param.id, user.id, body);
    return;
  }
}
