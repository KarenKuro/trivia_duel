import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { CategoryEntity } from './category.entity';
import { MatchEntity } from './match.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'match_category' })
export class MatchCategoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @JoinColumn({ name: 'user_id' })
  @ManyToOne(() => UserEntity, { nullable: true })
  user: UserEntity;

  @JoinColumn({ name: 'category_id' })
  @ManyToOne(() => CategoryEntity)
  category: CategoryEntity;

  @JoinColumn({ name: 'match_id' })
  @ManyToOne(() => MatchEntity, { onDelete: 'CASCADE' })
  match: MatchEntity;
}
