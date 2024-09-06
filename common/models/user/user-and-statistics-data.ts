import { UserEntity } from '@common/database';

export interface IUserAndStatisticsData extends UserEntity {
  meta: IUserAndStatisticsMetaData;
}

export interface IUserAndStatisticsMetaData {
  oldUserLevel: number;
  oldLongestWinCount: number;
  oldPlayedContinuouslyDays: number;
}
