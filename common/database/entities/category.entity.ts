import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';
import { BaseEntity } from '../base';
import { QuestionEntity } from './question.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'categories' })
export class CategoryEntity extends BaseEntity {
  @Column({ unique: true })
  name: string;

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

  // @Column()
  isActive?: boolean;
}
