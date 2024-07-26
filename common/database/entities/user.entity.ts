import { Column, Entity } from 'typeorm';

import { BaseEntity } from '../base';
import { UserStatus } from '@common/enums';

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
  @Column()
  uid: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;
}
