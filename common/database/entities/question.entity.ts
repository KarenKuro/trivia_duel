import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';

import { BaseEntity } from '../base';
import { QuestionType } from '@common/enums';
import { AnswerEntity } from './answer.entity';
import { CategoryEntity } from './category.entity';

@Entity({ name: 'questions' })
export class QuestionEntity extends BaseEntity {
  @Column({ type: 'text' })
  question: string;

  @OneToMany(() => AnswerEntity, (answer) => answer.question)
  answers: AnswerEntity[];

  @OneToOne(() => AnswerEntity)
  @JoinColumn()
  correctAnswer: AnswerEntity;

  @Column({
    type: 'enum',
    enum: QuestionType,
    default: QuestionType.MULTI,
  })
  type: QuestionType;

  @ManyToOne(() => CategoryEntity, (category) => category.questions)
  category: CategoryEntity;
}
