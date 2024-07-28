import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserService } from '@api-resources/user';
import { CategoryEntity } from '@common/database/entities';
import { IUserId } from '@common/models/common/user-id';
import { ICategory } from '@common/models';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly _userService: UserService,

    @InjectRepository(CategoryEntity)
    private readonly _categoryRepository: Repository<CategoryEntity>,
  ) {}

  async findAll(userId: IUserId): Promise<ICategory[]> {
    const id = userId.id;
    const allCategories = await this._categoryRepository
      .createQueryBuilder('categories')
      .leftJoin(
        'users_categories',
        'uc',
        'categories.id = uc.categoriesId AND uc.usersId = :id',
        { id },
      )
      .addSelect(
        'CASE WHEN usersId IS NULL THEN FALSE ELSE TRUE END',
        'categories_isActive',
      );
    return allCategories.getRawMany();
  }

  async findAllAvailable(userId: IUserId): Promise<ICategory[]> {
    const userWithCategories = await this._userService.findOne(userId.id);

    return userWithCategories.categories;
  }

  findOne(id: number) {
    return `This action returns a #${id} category`;
  }

  update(id: number, body: any) {
    console.log(body);

    return `This action updates a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
