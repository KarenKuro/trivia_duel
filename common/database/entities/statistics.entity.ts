import { Column, Entity } from 'typeorm';

import { BaseEntity } from '../base';

@Entity({ name: 'statistics' })
export class StatisticsEntity extends BaseEntity {
  @Column({ default: 0 })
  victories: number;

  @Column({ default: 0 })
  draws: number;

  @Column({ default: 0 })
  defeats: number;

  @Column({ default: 0, name: 'longest_win_count' })
  longestWinCount: number;

  @Column({ default: 0, name: 'current_win_count' })
  currentWinCount: number;

  @Column({ type: 'tinyint', default: 0, name: 'played_continuously' })
  playedContinuouslyDays: number;
}
