import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AnswerEntity } from './answer.entity';
import { LanguageEntity } from './language.entity';
import { BaseEntity } from '../base';

@Entity({ name: 'translated_answer' })
export class TranslatedAnswerEntity extends BaseEntity {
  @Column()
  translatedAnswer: string;

  @ManyToOne(() => AnswerEntity, (answer) => answer.translatedAnswers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'answer_id' })
  answer: AnswerEntity;

  @ManyToOne(() => LanguageEntity)
  @JoinColumn({ name: 'language_id' })
  language: LanguageEntity;
}
