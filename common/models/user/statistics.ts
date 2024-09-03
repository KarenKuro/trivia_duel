export interface IStatistics {
  id: number;
  victories: number;
  draws: number;
  defeats: number;
  longestWinCount: number;
  currentWinCount: number;
  playedContinuouslyDays: number;
  createdAt: Date;
  updatedAt: Date;
}
