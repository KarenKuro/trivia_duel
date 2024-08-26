import { Column, Entity } from 'typeorm';

import { BaseEntity } from '../base';

@Entity({ name: 'languages' })
export class LanguageEntity extends BaseEntity {
  @Column()
  key: string;

  @Column()
  native: string;
}
