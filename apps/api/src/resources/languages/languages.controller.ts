import { AuthUserGuard } from '@common/guards';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LanguagesService } from './languages.service';
import { LanguageResponseDTO } from './dto';
import { ResponseManager } from '@common/helpers';
import { ERROR_MESSAGES } from '@common/messages';

@Controller('languages')
@UseGuards(AuthUserGuard())
@ApiTags('Languages')
@ApiBearerAuth()
export class LanguagesController {
  constructor(private readonly _languagesService: LanguagesService) {}

  @Get('all')
  async findAll(): Promise<LanguageResponseDTO[]> {
    const languages = await this._languagesService.findAll();

    if (!languages.length) {
      throw ResponseManager.buildError(ERROR_MESSAGES.LANGUAGES_NOT_EXISTS);
    }

    return languages;
  }
}
