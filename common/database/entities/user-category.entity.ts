import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base';
import { MatchEntity } from './match.entity';
import { UserEntity } from './user.entity';
import { CategoryEntity } from './category.entity';

@Entity({ name: 'user_category' })
export class UserCategoryEntity extends BaseEntity {
  @JoinColumn({ name: 'user_id' })
  @ManyToOne(() => UserEntity, { nullable: true })
  user: UserEntity;

  @JoinColumn({ name: 'category_id' })
  @ManyToOne(() => CategoryEntity)
  category: CategoryEntity;

  @JoinColumn({ name: 'match_id' })
  @ManyToOne(() => MatchEntity)
  match: MatchEntity;
}
