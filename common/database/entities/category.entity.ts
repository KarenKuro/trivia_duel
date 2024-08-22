import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';
import { BaseEntity } from '../base';
import { QuestionEntity } from './question.entity';
import { UserEntity } from './user.entity';
import { TranslatedCategoryEntity } from './translated-category.entity';
import { MediaEntity } from './media.entity';

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

  @OneToMany(() => MediaEntity, (media) => media.category, {
    onDelete: 'CASCADE',
  })
  medias: MediaEntity[];
}
