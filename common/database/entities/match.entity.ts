import { ApiHideProperty } from '@nestjs/swagger';

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';

import { MatchLevel, MatchStatusType } from '@common/enums';

import { MatchCategoryEntity } from './match-category.entity';
import { QuestionEntity } from './question.entity';
import { UserAnswerEntity } from './user-answer.entity';
import { UserEntity } from './user.entity';
import { BaseEntity } from '../base';

@Entity({ name: 'matches' })
export class MatchEntity extends BaseEntity {
  @Column({
    type: 'enum',
    enum: MatchStatusType,
    default: MatchStatusType.PENDING,
  })
  status: MatchStatusType;

  @CreateDateColumn({
    name: 'started_at',
    type: 'datetime',
  })
  startedAt: Date;

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

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'looser_id' })
  looser: UserEntity;

  @Column({ enum: MatchLevel, default: MatchLevel.BRONZE, type: 'enum' })
  matchLevel: MatchLevel;

  @OneToMany(() => MatchCategoryEntity, (categories) => categories.match)
  categories: MatchCategoryEntity[];

  @OneToMany(() => UserAnswerEntity, (answer) => answer.match)
  userAsnwers: UserAnswerEntity[];

  @OneToOne(() => MatchEntity, (match) => match.nextMatch)
  @ApiHideProperty()
  previousMatch: MatchEntity;

  @OneToOne(() => MatchEntity, { cascade: true })
  @JoinColumn({ name: 'next_match_id' })
  nextMatch: MatchEntity;

  @Column({ default: false, name: 'against_bot' })
  againstBot: boolean;
}
