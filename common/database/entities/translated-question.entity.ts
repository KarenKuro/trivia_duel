import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base';
import { LanguageEntity } from './language.entity';
import { QuestionEntity } from './question.entity';

@Entity({ name: 'translated_question' })
export class TranslatedQuestionEntity extends BaseEntity {
  @Column()
  text: string;

  @ManyToOne(() => QuestionEntity, (question) => question.translatedQuestions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'question_id' })
  question: QuestionEntity;

  @ManyToOne(() => LanguageEntity)
  @JoinColumn({ name: 'language_id' })
  language: LanguageEntity;
}
