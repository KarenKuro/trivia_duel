import { MatchLevel, MatchStatusType } from '@common/enums';
import { BaseEntity } from '../base';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { CategoryEntity } from './category.entity';
import { QuestionEntity } from './question.entity';
import { UserAnswerEntity } from './user-answer.entity';
import { UserCategoryEntity } from './user-category.entity';

@Entity({ name: 'matches' })
export class MatchEntity extends BaseEntity {
  @Column({
    type: 'enum',
    enum: MatchStatusType,
    default: MatchStatusType.PENDING,
  })
  status: MatchStatusType;

  @ManyToMany(() => UserEntity)
  @JoinTable({
    name: 'match_users',
    joinColumn: { name: 'match_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  users: UserEntity[];

  @ManyToMany(() => CategoryEntity)
  @JoinTable({
    name: 'match_categories',
    joinColumn: { name: 'match_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories: CategoryEntity[];

  @ManyToMany(() => QuestionEntity)
  @JoinTable({
    name: 'match_questions',
    joinColumn: { name: 'match_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'question_id', referencedColumnName: 'id' },
  })
  questions: QuestionEntity[];

  @OneToOne(() => UserAnswerEntity)
  @JoinColumn({ name: 'last_answer_id' })
  lastAnswer: UserAnswerEntity;

  @Column({ enum: MatchLevel, default: MatchLevel.BRONZE, type: 'enum' })
  matchLevel: MatchLevel;

  @OneToMany(
    () => UserCategoryEntity,
    (choosenCategories) => choosenCategories.match,
  )
  choosenCategories: UserCategoryEntity[];
}
