import { ApiProperty } from '@nestjs/swagger';

import { Expose } from 'class-transformer';

export class StatisticsResponseDTO {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  victories: number;

  @Expose()
  @ApiProperty()
  draws: number;

  @Expose()
  @ApiProperty()
  defeats: number;

  @Expose()
  @ApiProperty()
  longestWinCount: number;

  @Expose()
  @ApiProperty()
  currentWinCount: number;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;

  @Expose()
  @ApiProperty()
  playedContinuouslyDays: number;
}
