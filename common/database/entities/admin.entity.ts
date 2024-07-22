import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../base';

@Entity({ name: 'admins' })
export class AdminEntity extends BaseEntity {
  @Column()
  adminName: string;

  @Column()
  password: string;
}
