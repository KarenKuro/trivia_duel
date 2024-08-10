import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';

import { MatchEntity, UserEntity } from '@common/database';
import { MatchStatusType } from '@common/enums';
import { MatchGateway, MatchService } from '@api-resources/match';
import { OnEvent } from '@nestjs/event-emitter';
import { UserService } from '@api-resources/user';
import * as schedule from 'node-schedule';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(MatchEntity)
    private readonly _matchRepository: Repository<MatchEntity>,

    private readonly _userService: UserService,
    private readonly _matchService: MatchService,
    private readonly _matchGateway: MatchGateway,
  ) {}

  // TODO: Put EVERY_10_SECONDS
  @Cron(CronExpression.EVERY_10_MINUTES)
  async closeNextMatches() {
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
        // Здесь user увидит, что второй отменил переигровку
      }
    });
  }

  // TODO: Put EVERY_10_SECONDS
  @Cron(CronExpression.EVERY_10_MINUTES)
  async endMatches() {
    const fiveMinutes: number = 1000 * 60 * 5;
    const fiveMinutesAgo = new Date(Date.now() - fiveMinutes);

    const matchesToUpdate = await this._matchRepository
      .createQueryBuilder('match')
      .where('match.createdAt < :fiveMinutesAgo', { fiveMinutesAgo })
      .andWhere('match.status IN (:...statuses)', {
        statuses: [
          MatchStatusType.PENDING,
          MatchStatusType.CATEGORY_CHOOSE,
          MatchStatusType.IN_PROCESS,
        ],
      })
      .getMany();

    matchesToUpdate.map(async (match) => {
      await this._matchRepository.update(match.id, {
        status: MatchStatusType.CANCELED,
      });

      const endedMatchData = await this._matchService.getMatchDataToSend(
        match.id,
      );
      this._matchGateway.sendMessageToHandlers(endedMatchData);
    });
  }

  @OnEvent('task.trigger')
  handleTaskTrigger(users: UserEntity[]) {
    const fifteenMinutesFromNow = new Date(Date.now() + 15 * 60 * 1000);
    console.log('event', users);

    schedule.scheduleJob(fifteenMinutesFromNow, async () => {
      for (const user of users) {
        let tickets = user.tickets;
        if (tickets < 5) {
          ++tickets;
          await this._userService.updateUser(user.id, { tickets }); // Обновляем значение tickets в базе данных
        }
      }
    });
  }
}
