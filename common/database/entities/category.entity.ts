import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../base';
import { QuestionEntity } from './question.entity';

@Entity({ name: 'categories' })
export class CategoryEntity extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ default: 0 })
  price: number;

  @Column({ default: false })
  isExclusive: boolean;

  @OneToMany(() => QuestionEntity, (question) => question.category, {
    onDelete: 'CASCADE',
  })
  questions: QuestionEntity[];
}
