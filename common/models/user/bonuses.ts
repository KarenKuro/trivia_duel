export interface IBonuses {
  userId: number;
  points: number;
  level: number;
  pointsToLevelUp: number;
  totalCoins: number;
  coinsForBigLevelUp: number;
  coinsForCurrentWinningStreak: number;
  coinsForPlayedContinuously: number;
}
