import { Column, Entity, ManyToOne } from 'typeorm';

import { BaseEntity } from '../base';
import { QuestionEntity } from './question.entity';

@Entity({ name: 'answers' })
export class AnswerEntity extends BaseEntity {
  @Column()
  value: string;

  @ManyToOne(() => QuestionEntity, (question) => question.answers)
  question: QuestionEntity;
}
