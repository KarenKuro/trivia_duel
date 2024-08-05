import { MatchLevel, MatchStatusType } from '@common/enums';
import { BaseEntity } from '../base';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { QuestionEntity } from './question.entity';
import { UserAnswerEntity } from './user-answer.entity';
import { MatchCategoryEntity } from './match-category.entity';

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

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'winner_id' })
  winner: UserEntity;

  @Column({ enum: MatchLevel, default: MatchLevel.BRONZE, type: 'enum' })
  matchLevel: MatchLevel;

  @OneToMany(() => MatchCategoryEntity, (categories) => categories.match)
  categories: MatchCategoryEntity[];

  @Column({ default: false })
  againstBot: boolean;
}
