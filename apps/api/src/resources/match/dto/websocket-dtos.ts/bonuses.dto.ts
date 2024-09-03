import { ApiProperty } from '@nestjs/swagger';

export class BonusesDTO {
  @ApiProperty()
  userId: number;

  @ApiProperty()
  pointsForCorrectAnswers: number;

  @ApiProperty()
  requiredPointsToLevelUp: number;

  @ApiProperty()
  coinsForEveryTenLevelUp: number;

  @ApiProperty()
  coinsForCurrentWinningStreak: number;

  @ApiProperty()
  coinsForPlayedContinuouslyForFiveDays: number;

  @ApiProperty()
  levelAfterGame: number;

  @ApiProperty()
  coinsAfterGame: number;
}
