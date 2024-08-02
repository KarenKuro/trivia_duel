import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base';
import { UserEntity } from './user.entity';
import { MatchEntity } from './match.entity';
import { AnswerEntity } from './answer.entity';
import { QuestionEntity } from './question.entity';

@Entity({ name: 'users_answers' })
export class UserAnswerEntity extends BaseEntity {
  @JoinColumn({ name: 'user_id' })
  @ManyToOne(() => UserEntity)
  user: UserEntity;

  @JoinColumn({ name: 'match_id' })
  @ManyToOne(() => MatchEntity)
  match: MatchEntity;

  @JoinColumn({ name: 'answer_id' })
  @ManyToOne(() => AnswerEntity, {
    nullable: true,
  })
  answer: AnswerEntity;

  @JoinColumn({ name: 'question_id' })
  @ManyToOne(() => QuestionEntity)
  question: QuestionEntity;

  @Column({
    type: 'boolean',
    name: 'is_correct',
    nullable: false,
  })
  isCorrect: boolean;
}
