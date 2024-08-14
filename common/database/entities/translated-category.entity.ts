import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base';
import { CategoryEntity } from './category.entity';
import { LanguageEntity } from './language.entity';

@Entity({ name: 'translated_category' })
export class TranslatedCategoryEntity extends BaseEntity {
  @Column()
  translatedName: string;

  @ManyToOne(
    () => CategoryEntity,
    (category) => category.translatedCategories,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;

  @ManyToOne(() => LanguageEntity)
  @JoinColumn({ name: 'language_id' })
  language: LanguageEntity;
}
