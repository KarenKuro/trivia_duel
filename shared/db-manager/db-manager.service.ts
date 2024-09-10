import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { MatchStatusType } from '@common/enums';
import { IPlayedCount } from '@common/models';

@Injectable()
export class DbManagerService {
  constructor(private readonly _entityManager: EntityManager) {}

  async runQuery<T>(queryString: string): Promise<T> {
    return this._entityManager.query(queryString);
  }

  async getTime(): Promise<Date> {
    const [{ currTime }] = await this._entityManager.query(
      `SELECT now() as "currTime";`,
    );

    return currTime;
  }

  async getUserMatchesByDay(userId: number): Promise<IPlayedCount> {
    const queryString = `
    SELECT COALESCE(today_matches.total,0) as today_count, COALESCE(yesterday_matches.total,0) as yesterday_count FROM matches m
      JOIN match_users mu 
        ON m.id = mu.match_id 
      LEFT JOIN (
                  SELECT COUNT(*) as total, mu.user_id FROM matches m join match_users mu on m.id = mu.match_id 
                  WHERE m.created_at > CURDATE() AND m.status = '${MatchStatusType.ENDED}' AND mu.user_id = '${userId}' group by mu.user_id
                ) today_matches
         ON today_matches.user_id = mu.user_id
      LEFT JOIN (
                  SELECT COUNT(*) as total, mu.user_id FROM matches m join match_users mu on m.id = mu.match_id 
                  WHERE m.created_at > (CURDATE() - INTERVAL 1 DAY) AND m.created_at < CURDATE() AND m.status = '${MatchStatusType.ENDED}' AND mu.user_id = '${userId}' group by mu.user_id
                ) yesterday_matches
          ON yesterday_matches.user_id = mu.user_id
      WHERE m.status = '${MatchStatusType.ENDED}' AND mu.user_id = '${userId}' 
      GROUP BY mu.user_id;`;

    const [data] = await this.runQuery<[IPlayedCount]>(queryString);

    return data;
  }
}
