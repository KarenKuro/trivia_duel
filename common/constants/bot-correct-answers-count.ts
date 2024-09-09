import { MatchLevel } from '@common/enums';

export const BOT_CORRECT_ANSWERS_COUNT: Record<MatchLevel, number> = {
  [MatchLevel.BRONZE]: 3,
  [MatchLevel.SILVER]: 4,
  [MatchLevel.GOLD]: 5,
  [MatchLevel.PLATINUM]: 6,
};
