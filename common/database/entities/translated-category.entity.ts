import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { CategoryEntity } from './category.entity';
import { LanguageEntity } from './language.entity';
import { BaseEntity } from '../base';

@Entity({ name: 'translated_category' })
export class TranslatedCategoryEntity extends BaseEntity {
  @Column()
  text: string;

  @ManyToOne(
    () => CategoryEntity,
    (category) => category.translatedCategories,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;

  @ManyToOne(() => LanguageEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'language_id' })
  language: LanguageEntity;
}
