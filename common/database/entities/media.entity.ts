import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../base';

@Entity({ name: 'media_files' })
export class MediaEntity extends BaseEntity {
  @Column()
  path: string;
}
