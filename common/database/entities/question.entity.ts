import { ApiHideProperty } from '@nestjs/swagger';

import { Exclude } from 'class-transformer';
import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';

import { QuestionType } from '@common/enums';

import { AnswerEntity } from './answer.entity';
import { CategoryEntity } from './category.entity';
import { TranslatedQuestionEntity } from './translated-question.entity';
import { BaseEntity } from '../base';

@Entity({ name: 'questions' })
export class QuestionEntity extends BaseEntity {
  @Column({ type: 'text' })
  text: string;

  @OneToMany(() => AnswerEntity, (answer) => answer.question, {
    onDelete: 'CASCADE',
  })
  answers: AnswerEntity[];

  @OneToOne(() => AnswerEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'correct_answer_id' })
  correctAnswer: AnswerEntity;

  @Column({
    type: 'enum',
    enum: QuestionType,
    default: QuestionType.MULTI,
  })
  type: QuestionType;

  @ManyToOne(() => CategoryEntity, (category) => category.questions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;

  @OneToMany(
    () => TranslatedQuestionEntity,
    (translatedQuestion) => translatedQuestion.question,
  )
  translatedQuestions: TranslatedQuestionEntity[];

  @ApiHideProperty()
  @Exclude()
  @DeleteDateColumn({
    name: 'deleted_at',
  })
  deletedAt?: Date;
}
