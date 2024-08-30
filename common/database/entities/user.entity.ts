import { ApiHideProperty } from '@nestjs/swagger';

import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToOne,
} from 'typeorm';

import { UserStatus } from '@common/enums';

import { CategoryEntity } from './category.entity';
import { MatchEntity } from './match.entity';
import { StatisticsEntity } from './statistics.entity';
import { BaseEntity } from '../base';

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

  @Column({ default: 0 })
  level: number;

  @Column({ default: 0 })
  points: number;

  @Column({ default: 5 })
  tickets: number;

  @OneToOne(() => StatisticsEntity, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  statistics: StatisticsEntity;

  @Column({ default: 'assets/images/Avatars-4.svg' })
  avatar?: string;
}
