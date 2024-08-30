import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';

import * as schedule from 'node-schedule';
import { Repository } from 'typeorm';

import { MatchGateway, MatchService } from '@api-resources/match';
import { UserService } from '@api-resources/user';

import { MatchEntity, UserAnswerEntity, UserEntity } from '@common/database';
import { MatchStatusType } from '@common/enums';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(MatchEntity)
    private readonly _matchRepository: Repository<MatchEntity>,

    @InjectRepository(UserAnswerEntity)
    private readonly _userAnswerRepository: Repository<UserAnswerEntity>,

    private readonly _userService: UserService,
    private readonly _matchService: MatchService,
    private readonly _matchGateway: MatchGateway,
  ) {}

  // To change the match to closed if the opponent does not agree to a replay within 10 seconds
  // TODO: Put EVERY_10_SECONDS
  @Cron(CronExpression.EVERY_10_MINUTES)
  async closeNextMatches() {
    const matches = await this._matchRepository
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.nextMatch', 'nextMatch')
      .where('nextMatch.createdAt < DATE_SUB(now(), INTERVAL 10 SECOND)')
      .andWhere('nextMatch.status = :status', {
        status: MatchStatusType.PENDING,
      })
      .getMany();

    matches.map(async (match) => {
      if (match.nextMatch) {
        await this._matchRepository.update(match.nextMatch.id, {
          status: MatchStatusType.CANCELED,
        });

        const previousMatchData = await this._matchService.getMatchDataToSend(
          match.id,
        );
        this._matchGateway.sendMessageToHandlers(previousMatchData);
        // Here the user will see that the second one has cancelled the replay
      }
    });
  }

  // Force canceled match if the match continious more than 5 minutes
  // TODO: Put EVERY_10_SECONDS, and change interval to 30 sec
  @Cron(CronExpression.EVERY_10_SECONDS)
  async canceledMatches() {
    const matchesToUpdate = await this._matchRepository
      .createQueryBuilder('match')
      .where('match.createdAt < DATE_SUB(now(), INTERVAL 30 MINUTE)')
      .andWhere('match.status IN (:...statuses)', {
        statuses: [MatchStatusType.PENDING, MatchStatusType.CATEGORY_CHOOSE],
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

  // Change match status to ended if match started more than 2 minute
  // TODO Put EVERY_10_SECONDS, and change interval to time , how long should the match last(example: 2 minutes)
  @Cron(CronExpression.EVERY_10_SECONDS)
  async endMatches() {
    const matchesToUpdate = await this._matchRepository
      .createQueryBuilder('match')
      .where('match.startedAt < DATE_SUB(now(), INTERVAL 10 MINUTE)')
      .andWhere('match.status = :status', {
        status: MatchStatusType.IN_PROCESS,
      })
      .getMany();

    matchesToUpdate.map(async (match) => {
      const endedMatchData = await this._matchService.getMatchDataToSend(
        match.id,
      );
      const matchUserAnswers = await this._userAnswerRepository.find({
        where: {
          match: { id: match.id },
        },
        relations: ['user'],
      });

      await this._matchService.finishMatchWithRealOpponent(
        endedMatchData,
        matchUserAnswers,
      );
    });
  }

  // add tiket, after 15 minutes, when match ended
  // TODO: change fifteenMinutesFromNow(uncomment: '* 60')
  @OnEvent('task.trigger')
  handleTaskTrigger(users: UserEntity[]) {
    const fifteenMinutesFromNow = new Date(Date.now() + 15 * 1000); // * 60);

    schedule.scheduleJob(fifteenMinutesFromNow, async () => {
      for (const user of users) {
        let tickets = user.tickets;
        if (tickets < 5) {
          ++tickets;
          await this._userService.updateUser(user.id, { tickets }); // update user.tikets in db
        }
        await this._matchGateway.sendUserData({ ...user, tickets });
      }
    });

    (async () => {
      for (const user of users) {
        let tickets = user.tickets;
        if (tickets < 5) {
          ++tickets;
          await this._userService.updateUser(user.id, { tickets }); // обновление user.tickets в базе данных
        }
        await this._matchGateway.sendUserData({ ...user, tickets });
      }
    })();
  }
}
// в юзер сервисе сделаю метод
