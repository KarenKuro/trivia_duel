import { AuthUser } from '@common/decorators';
import { IdDTO, SuccessDTO, TokenPayloadDTO } from '@common/dtos';
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { MatchService } from './match.service';
import { AuthUserGuard } from '@common/guards';
import { CategoriesDTO, MatchResponseDTO } from './dto';
import { ResponseManager } from '@common/helpers';
import { ERROR_MESSAGES } from '@common/messages';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('matches')
@UseGuards(AuthUserGuard())
@ApiTags('Matches')
@ApiBearerAuth()
export class MatchController {
  constructor(private readonly _matchService: MatchService) {}

  @Post('start')
  @ApiOperation({
    summary: 'Join to match, if can find, or not - create new match',
  })
  async createMatch(
    @AuthUser() token: TokenPayloadDTO,
  ): Promise<MatchResponseDTO> {
    const match = await this._matchService.createOrJoinMatch(token);
    if (!match) {
      throw ResponseManager.buildError(ERROR_MESSAGES.INCORRECT_MATCH_MAKING);
    }

    return match;
  }

  // categorynery kawelnan matchi mej // hamadzayn categoryi questionnery kkpnin matchin // u statusy kpoxe
  @Post(':id/categories')
  @ApiOperation({
    summary: 'Add categories and questions in match',
  })
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
  @ApiOperation({
    summary: 'Get Match data by Match Id',
  })
  async get(@Param() param: IdDTO) {
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
