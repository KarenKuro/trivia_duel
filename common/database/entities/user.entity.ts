import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';

import { BaseEntity } from '../base';
import { UserStatus } from '@common/enums';
import { CategoryEntity } from './category.entity';
import { MatchEntity } from './match.entity';
import { ApiHideProperty } from '@nestjs/swagger';

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
  @Column()
  uid: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  email: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @ManyToMany(() => CategoryEntity, (category) => category.users)
  @JoinTable({
    name: 'users_categories',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories: CategoryEntity[];

  @Column({ default: 0 })
  coins: number;

  @Column({ default: 0 })
  premiumCoins: number;

  @Column({ default: false })
  subscription: boolean;

  // @Column({ nullable: true })       ????????????????????
  // subscriptionEnding: Date;
  @ManyToMany(() => MatchEntity, { cascade: true })
  @ApiHideProperty()
  matches: MatchEntity[];

  @Column({ default: 1 })
  level: number;

  @Column({ default: 0 })
  points: number;

  @Column({ default: 5 })
  tickets: number;

  @Column({ default: 0, name: 'longest_win_count' })
  longestWinCount: number;

  @Column({ default: 0, name: 'current_win_count' })
  currentWinCount: number;
}
