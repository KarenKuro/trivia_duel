import { ILevelInfo } from '@common/models';

export class LevelHelpers {
  static getLevelInfo(userPoints: number): ILevelInfo {
    let level = 0;
    let pointsToLevelUp = 0;

    console.log('get LevelInfo start: userPoints', userPoints);
    if (userPoints <= 200) {
      console.log('userPoints <= 200');
      level = Math.floor(userPoints / 10);
      pointsToLevelUp = 10 - (userPoints % 10);
    } else if (userPoints <= 1700) {
      console.log('userPoints <= 1700');
      level = 20 + Math.floor((userPoints - 200) / 50);
      pointsToLevelUp = 50 - ((userPoints - 200) % 50);
    } else if (userPoints <= 6700) {
      console.log('userPoints <= 6700');
      level = 50 + Math.floor((userPoints - 1700) / 100);
      pointsToLevelUp = 100 - ((userPoints - 1700) % 100);
    } else {
      console.log('getLevelInfo else');
      level = 100 + Math.floor((userPoints - 6700) / 200);
      pointsToLevelUp = 200 - ((userPoints - 6700) % 200);
    }
    console.log('getLevelInfo end');

    return { level, pointsToLevelUp };
  }
}
