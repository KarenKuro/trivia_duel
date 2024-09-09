import { MatchLevel } from '@common/enums';

export const POINTS_FOR_CORRECT_ANSWERS: Record<MatchLevel, number> = {
  [MatchLevel.BRONZE]: 2,
  [MatchLevel.SILVER]: 5,
  [MatchLevel.GOLD]: 10,
  [MatchLevel.PLATINUM]: 20,
};
