export interface IBonuses {
  userId: number;
  pointsForCorrectAnswers: number;
  requiredPointsToLevelUp: number;
  coinsForEveryTenLevelUp: number;
  coinsForCurrentWinningStreak: number;
  coinsForPlayedContinuouslyForFiveDays: number;
  levelAfterGame: number;
  coinsAfterGame: number;
}
