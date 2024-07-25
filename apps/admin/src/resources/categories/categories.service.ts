import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CategoryEntity } from '@common/database/entities';
import {
  ICategory,
  ICreateCategory,
  IMessageSuccess,
  IPagination,
} from '@common/models';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly _categoryRepository: Repository<CategoryEntity>,
  ) {}

  async create(body: ICreateCategory): Promise<ICategory> {
    const category = await this._categoryRepository.save(body);

    return category;
  }

  async findAll(pagination: IPagination): Promise<ICategory[]> {
    const { offset, limit } = pagination;
    const categories = await this._categoryRepository.find({
      skip: +offset,
      take: +limit,
    });

    return categories;
  }

  async findOne(param: Partial<ICategory>): Promise<ICategory> {
    const category = await this._categoryRepository.findOne({
      where: param,
    });

    return category;
  }

  async update(
    category: ICategory,
    body: Partial<ICreateCategory>,
  ): Promise<IMessageSuccess> {
    await this._categoryRepository.update(category.id, body);

    return { success: true };
  }

  async remove(category: ICategory): Promise<IMessageSuccess> {
    await this._categoryRepository.delete(category.id);

    return { success: true };
  }
}
