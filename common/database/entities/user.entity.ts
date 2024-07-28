import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';

import { BaseEntity } from '../base';
import { UserStatus } from '@common/enums';
import { CategoryEntity } from './category.entity';

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
  @JoinTable({ name: 'users_categories' })
  categories: CategoryEntity[];

  @Column({ default: 0 })
  coins: number;

  @Column({ default: 0 })
  premiumCoins: number;

  @Column({ default: false })
  subscription: boolean;

  // @Column({ nullable: true })       ????????????????????
  // subscriptionEnding: Date;

  @Column({ default: 1 })
  level: number;

  @Column({ default: 0 })
  points: number;

  @Column({ default: 5 })
  lives: number;
}
