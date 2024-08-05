import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';

import { MatchEntity } from '@common/database';
import { MatchStatusType } from '@common/enums';
import { MatchGateway, MatchService } from '@api-resources/match';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(MatchEntity)
    private readonly _matchRepository: Repository<MatchEntity>,

    private readonly _matchService: MatchService,
    private readonly _matchGateway: MatchGateway,
  ) {}

  // TODO: Put EVERY_5_SECONDS
  @Cron(CronExpression.EVERY_10_MINUTES)
  async closeMatches() {
    const tenSecondsInMs: number = 10000;
    const tenSecondsAgo = new Date(Date.now() - tenSecondsInMs);

    const matches = await this._matchRepository.find({
      where: {
        nextMatch: {
          createdAt: LessThan(tenSecondsAgo),
          status: MatchStatusType.PENDING,
        },
      },
      relations: ['nextMatch'],
    });

    matches.map(async (match) => {
      if (match.nextMatch) {
        await this._matchRepository.update(match.nextMatch.id, {
          status: MatchStatusType.CANCELED,
        });

        const previousMatchData = await this._matchService.getMatchDataToSend(
          match.id,
        );
        this._matchGateway.sendMessageToHandlers(previousMatchData);
      }
    });
  }
}
