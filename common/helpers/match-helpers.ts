import { MATCH_LEVELS_MAP } from '@common/constants';
import { MatchLevel } from '@common/enums';

export class MatchHelpers {
  static getLevel(userLevel: number): MatchLevel {
    if (!userLevel) return MatchLevel.BRONZE;
    let matchStatus = MatchLevel.BRONZE;
    for (const key in MATCH_LEVELS_MAP) {
      if (userLevel >= MATCH_LEVELS_MAP[key]) {
        matchStatus = key as MatchLevel;
      }
    }

    return matchStatus;
  }
}
