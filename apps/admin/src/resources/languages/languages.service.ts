import { LanguageEntity } from '@common/database';
import { ICreateLanguage, ILanguage } from '@common/models/language';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class LanguagesService {
  constructor(
    @InjectRepository(LanguageEntity)
    private readonly _languageRepository: Repository<LanguageEntity>,
  ) {}

  async create(body: ICreateLanguage): Promise<ILanguage> {
    const language = await this._languageRepository.save(body);

    return language;
  }

  async findAll(): Promise<ILanguage[]> {
    const languages = await this._languageRepository.find();

    return languages;
  }

  async findOne(param: Partial<ILanguage>): Promise<ILanguage> {
    const language = await this._languageRepository.findOne({ where: param });

    return language;
  }
}
