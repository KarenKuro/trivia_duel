import { ApiProperty } from '@nestjs/swagger';

export class BonusesDTO {
  @ApiProperty()
  userId: number;

  @ApiProperty()
  matchPoints: number;

  @ApiProperty()
  level: number;

  @ApiProperty()
  pointsToLevelUp: number;

  @ApiProperty()
  totalCoins: number;

  @ApiProperty()
  coinsForBigLevelUp: number;

  @ApiProperty()
  coinsForCurrentWinningStreak: number;

  @ApiProperty()
  coinsForPlayedContinuously: number;
}
