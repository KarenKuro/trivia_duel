import { ApiProperty } from '@nestjs/swagger';

import { Transform } from 'class-transformer';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToMany,
  OneToOne,
} from 'typeorm';

import { FileHelpers } from '@common/helpers';

import { MediaEntity } from './media.entity';
import { QuestionEntity } from './question.entity';
import { TranslatedCategoryEntity } from './translated-category.entity';
import { UserEntity } from './user.entity';
import { BaseEntity } from '../base';

@Entity({ name: 'categories' })
export class CategoryEntity extends BaseEntity {
  @Column({ unique: true })
  text: string;

  @Column({ default: 0 })
  price: number;

  // @Column({ default: false })
  // isExclusive: boolean;

  @Column({ default: 0 })
  premiumPrice: number;

  @OneToMany(() => QuestionEntity, (question) => question.category, {
    onDelete: 'CASCADE',
  })
  questions: QuestionEntity[];

  @ManyToMany(() => UserEntity, (user) => user.categories)
  users: UserEntity[];

  isActive?: boolean;

  @OneToMany(
    () => TranslatedCategoryEntity,
    (translatedCategory) => translatedCategory.category,
  )
  translatedCategories: TranslatedCategoryEntity[];

  @OneToOne(() => MediaEntity)
  @JoinColumn({ name: 'image_id' })
  @Transform(({ value }) => {
    return FileHelpers.generatePath(value?.path);
  })
  @ApiProperty()
  image: MediaEntity | string;
}
