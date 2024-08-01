import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MatchEntity } from './match.entity';
import { UserEntity } from './user.entity';
import { CategoryEntity } from './category.entity';

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
  @ManyToOne(() => MatchEntity)
  match: MatchEntity;
}
