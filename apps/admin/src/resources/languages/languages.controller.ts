import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthUserGuard } from '@common/guards';
import { LanguagesService } from './languages.service';
import { CreateLanguageDTO, LanguageResponseDTO } from './dto';
import { ResponseManager } from '@common/helpers';
import { ERROR_MESSAGES } from '@common/messages';
import { IdDTO } from '@common/dtos';

@Controller('languages')
@UseGuards(AuthUserGuard())
@ApiTags('Languages')
@ApiBearerAuth()
export class LanguagesController {
  constructor(private readonly _languagesService: LanguagesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new language' })
  @ApiResponse({
    status: 201,
    description: 'Return created language',
    type: LanguageResponseDTO,
  })
  async create(@Body() body: CreateLanguageDTO): Promise<LanguageResponseDTO> {
    const existLanguage = await this._languagesService.findOne({
      key: body.key,
    });

    if (existLanguage) {
      throw ResponseManager.buildError(ERROR_MESSAGES.LANGUAGE_ALREADY_EXIST);
    }

    const language = await this._languagesService.create(body);
    return language;
  }

  @Get()
  @ApiOperation({ summary: 'Get all languages' })
  async findAll(): Promise<LanguageResponseDTO[]> {
    const languges = await this._languagesService.findAll();
    return languges;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a language by id' })
  async findOneById(@Param() param: IdDTO): Promise<LanguageResponseDTO> {
    const language = await this._languagesService.findOne({ id: +param.id });

    if (!language) {
      throw ResponseManager.buildError(ERROR_MESSAGES.LANGUAGE_NOT_EXIST);
    }

    return language;
  }
}
