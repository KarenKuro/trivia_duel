import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base';
import { CategoryEntity } from './category.entity';

@Entity({ name: 'media_files' })
export class MediaEntity extends BaseEntity {
  @Column()
  path: string;

  @ManyToOne(() => CategoryEntity)
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;
}
