import { Column, Entity } from 'typeorm';

import { BaseEntity } from '../base';

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
  @Column()
  uid: string;

  @Column()
  name: string;

  @Column()
  email: string;
}
