import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { omit } from 'lodash';

import {
  CategoryEntity,
  LanguageEntity,
  TranslatedCategoryEntity,
} from '@common/database/entities';
import {
  ICategory,
  ICreateCategory,
  IMessageSuccess,
  IPagination,
  IUpdateCategory,
} from '@common/models';
import { LanguagesService } from '@admin-resources/languages';
import { ResponseManager } from '@common/helpers';
import { ERROR_MESSAGES } from '@common/messages';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly _categoryRepository: Repository<CategoryEntity>,

    @InjectRepository(TranslatedCategoryEntity)
    private readonly _translatedCategoryRepository: Repository<TranslatedCategoryEntity>,

    private readonly _languagesService: LanguagesService,
  ) {}

  @Transactional()
  async create(body: ICreateCategory): Promise<ICategory> {
    const category = (await this._categoryRepository.save({
      text: body.text,
      premiumPrice: body.premiumPrice,
      price: body.price,
    })) as CategoryEntity;

    const languages = await this._languagesService.findAll();
    const languagesIds = languages.map((language) => language.id);

    const translatedCategories: TranslatedCategoryEntity[] = await Promise.all(
      body.translatedCategories.map((translatedCategory) => {
        if (!languagesIds.includes(translatedCategory.languageId)) {
          throw ResponseManager.buildError(ERROR_MESSAGES.LANGUAGE_NOT_EXIST);
        }

        return this._translatedCategoryRepository.save({
          text: translatedCategory.text,
          category: { id: category.id } as CategoryEntity,
          language: { id: translatedCategory.languageId } as LanguageEntity,
        });
      }),
    );

    return { ...category, translatedCategories };
  }
  // TODO возвращать entity
  async findAll(pagination: IPagination): Promise<ICategory[]> {
    const { offset, limit } = pagination;
    const categories = await this._categoryRepository.find({
      skip: +offset,
      take: +limit,
      relations: ['translatedCategories', 'translatedCategories.language'],
    });

    return categories;
  }

  async findOne(param: Partial<ICategory>): Promise<ICategory> {
    const category = await this._categoryRepository.findOne({
      where: param,
      relations: ['translatedCategories', 'translatedCategories.language'],
    });

    return category;
  }

  @Transactional()
  async update(
    category: ICategory,
    body: Partial<IUpdateCategory>,
  ): Promise<IMessageSuccess> {
    if (body.translatedCategories) {
      const categoryData = await this.findOne({ id: category.id });
      const translatedIds = categoryData.translatedCategories.map((e) => e.id);
      for (const translatedCategory of body.translatedCategories) {
        if (!translatedIds.includes(translatedCategory.id)) {
          throw ResponseManager.buildError(
            ERROR_MESSAGES.TRANSLATED_CATEGORY_NOT_EXIST,
          );
        }

        await this._translatedCategoryRepository.update(
          translatedCategory.id,
          translatedCategory,
        );
      }
    }

    await this._categoryRepository.update(
      category.id,
      omit(body, ['translatedCategories']),
    );

    return { success: true };
  }

  @Transactional()
  async remove(category: ICategory): Promise<IMessageSuccess> {
    await this._categoryRepository.delete(category.id);

    return { success: true };
  }
}
