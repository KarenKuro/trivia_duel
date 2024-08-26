import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

import { QuestionEntity } from './question.entity';
import { TranslatedAnswerEntity } from './translated-answer.entity';
import { BaseEntity } from '../base';

@Entity({ name: 'answers' })
export class AnswerEntity extends BaseEntity {
  @Column()
  text: string;

  @ManyToOne(() => QuestionEntity, (question) => question.answers, {
    onDelete: 'CASCADE',
  })
  question: QuestionEntity;

  @OneToMany(
    () => TranslatedAnswerEntity,
    (translatedAnswer) => translatedAnswer.answer,
  )
  translatedAnswers: TranslatedAnswerEntity[];
}
