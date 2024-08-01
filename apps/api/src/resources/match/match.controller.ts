import { AuthUser } from '@common/decorators';
import { IdDTO, SuccessDTO, TokenPayloadDTO } from '@common/dtos';
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { MatchService } from './match.service';
import { AuthUserGuard } from '@common/guards';
import { CategoriesDTO, MatchResponseDTO } from './dto';
import { ResponseManager } from '@common/helpers';
import { ERROR_MESSAGES } from '@common/messages';

@Controller('matches')
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
  async selectCategories(
    @Param() match: IdDTO,
    @Body() body: CategoriesDTO,
    @AuthUser() userPayload: TokenPayloadDTO,
  ): Promise<SuccessDTO> {
    await this._matchService.selectCategories(+match.id, body, userPayload);

    return { success: true };
    // categorynery kawelnan matchi mej // hamadzayn categoryi questionnery kkpnin matchin // u statusy kpoxe
  }

  @Get(':id')
  async get(@Param() param: IdDTO) {
    // Matchi datan get kexni, neraryal, questionnery, usernery yew amen inch
    return this._matchService.findOne(+param.id);
  }

  // @Post(':id/answer')
  // async asnwer(
  //   @Param() param: IdDTO,
  //   @AuthUser() user: ITokenPayload,
  //   @Body() body: any,
  // ) {
  //   await this._matchService.answer(+param.id, user.id, body);
  //   return;
  // }
}
