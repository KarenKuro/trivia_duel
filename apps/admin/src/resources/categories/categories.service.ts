import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { omit } from 'lodash';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

import { LanguagesService } from '@admin-resources/languages';

import {
  CategoryEntity,
  LanguageEntity,
  MediaEntity,
  TranslatedCategoryEntity,
} from '@common/database/entities';
import { ResponseManager } from '@common/helpers';
import { ERROR_MESSAGES } from '@common/messages';
import {
  ICategory,
  ICreateCategory,
  IMessageSuccess,
  IPagination,
  IUpdateCategory,
} from '@common/models';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly _categoryRepository: Repository<CategoryEntity>,

    @InjectRepository(TranslatedCategoryEntity)
    private readonly _translatedCategoryRepository: Repository<TranslatedCategoryEntity>,

    @InjectRepository(MediaEntity)
    private readonly _mediaRepository: Repository<MediaEntity>,

    private readonly _languagesService: LanguagesService,
  ) {}

  @Transactional()
  async create(body: ICreateCategory): Promise<void> {
    const image = await this._mediaRepository.save({
      path: body.path,
    });
    const category = (await this._categoryRepository.save({
      text: body.text,
      premiumPrice: body.premiumPrice,
      price: body.price,
      image: {
        id: image.id,
      },
    })) as CategoryEntity;
    const languages = await this._languagesService.findAll();
    const languagesIds = languages.map((language) => language.id);

    const translatedCategories = body.translatedCategories.map(
      (translatedCategory) => {
        if (!languagesIds.includes(translatedCategory.languageId)) {
          throw ResponseManager.buildError(ERROR_MESSAGES.LANGUAGE_NOT_EXIST);
        }

        return this._translatedCategoryRepository.create({
          text: translatedCategory.text,
          category: { id: category.id } as CategoryEntity,
          language: { id: translatedCategory.languageId } as LanguageEntity,
        });
      },
    );

    await this._translatedCategoryRepository.save(translatedCategories);
  }

  async findAll(pagination: IPagination): Promise<CategoryEntity[]> {
    const { offset, limit } = pagination;
    const categories = await this._categoryRepository.find({
      skip: +offset,
      take: +limit,
      relations: [
        'translatedCategories',
        'translatedCategories.language',
        'image',
      ],
    });

    return categories;
  }

  async findOne(param: Partial<ICategory>): Promise<ICategory> {
    const category = await this._categoryRepository.findOne({
      where: param,
      relations: [
        'translatedCategories',
        'translatedCategories.language',
        'image',
      ],
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
      const bodyTranslatedCategoriesIds = body.translatedCategories.map(
        (e) => e.id,
      );
      const uniqueTranslatedIds = new Set([...bodyTranslatedCategoriesIds]);

      if (bodyTranslatedCategoriesIds.length !== uniqueTranslatedIds.size) {
        throw ResponseManager.buildError(
          ERROR_MESSAGES.TRANSLATED_CATEGORIES_NOT_UNIQUE,
        );
      }

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

    if (body.path) {
      const categoryData = await this.findOne({ id: category.id });
      await this._mediaRepository.update(
        (categoryData.image as MediaEntity).id,
        {
          path: body.path,
        },
      );
    }

    await this._categoryRepository.update(
      category.id,
      omit(body, ['translatedCategories', 'path']),
    );

    return { success: true };
  }

  @Transactional()
  async remove(category: ICategory): Promise<IMessageSuccess> {
    await this._categoryRepository.delete(category.id);

    return { success: true };
  }
}
