import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../base';
import { Exclude } from 'class-transformer';

@Entity({ name: 'admins' })
export class AdminEntity extends BaseEntity {
  @Column()
  adminName: string;

  @Exclude()
  @Column()
  password: string;
}
