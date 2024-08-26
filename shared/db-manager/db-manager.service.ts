import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

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
}
