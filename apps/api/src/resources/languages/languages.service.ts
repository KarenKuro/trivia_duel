import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { LanguageEntity } from '@common/database';
import { ILanguage } from '@common/models';

@Injectable()
export class LanguagesService {
  constructor(
    @InjectRepository(LanguageEntity)
    private readonly _languagesRepository: Repository<LanguageEntity>,
  ) {}

  async findAll(): Promise<ILanguage[]> {
    const languages = await this._languagesRepository.find();

    return languages;
  }
}
