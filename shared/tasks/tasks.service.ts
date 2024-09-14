import { Injectable, OnModuleInit } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';

import * as schedule from 'node-schedule';
import { Repository } from 'typeorm';

import { LanguagesService } from '@api-resources/languages';
import { MatchGateway, MatchService } from '@api-resources/match';
import { UserService } from '@api-resources/user';

import { MatchEntity, UserAnswerEntity, UserEntity } from '@common/database';
import { MatchStatusType } from '@common/enums';
import { StringHelpers } from '@common/helpers';
import { LANGUAGES } from '@common/sets';

@Injectable()
export class TasksService implements OnModuleInit {
  constructor(
    @InjectRepository(MatchEntity)
    private readonly _matchRepository: Repository<MatchEntity>,

    @InjectRepository(UserAnswerEntity)
    private readonly _userAnswerRepository: Repository<UserAnswerEntity>,

    private readonly _userService: UserService,
    private readonly _matchService: MatchService,
    private readonly _matchGateway: MatchGateway,
    private readonly _languagesService: LanguagesService,
  ) {}

  //To attach a bot to a match and move the match to the CATEGORY_CHOOSE stage
  @Cron('*/3 * * * * *')
  async attachBot(): Promise<void> {
    const matches = await this._matchRepository
      .createQueryBuilder('match')
      .where('match.createdAt < DATE_SUB(now(), INTERVAL 10 SECOND)')
      .andWhere('match.status = :status', {
        status: MatchStatusType.PENDING,
      })
      .getMany();

    matches.map(async (match) => {
      await this._matchRepository.update(match.id, {
        status: MatchStatusType.CATEGORY_CHOOSE,
        botName: StringHelpers.getRandomHumanName(),
      });

      const updatedMatch = await this._matchService.getMatchDataToSend(
        match.id,
      );

      this._matchGateway.sendMessageToHandlers(updatedMatch);
    });
  }

  // To change the match to closed if the opponent does not agree to a replay within 5 seconds
  @Cron(CronExpression.EVERY_5_SECONDS)
  async closeNextMatches(): Promise<void> {
    const matches = await this._matchRepository
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.nextMatch', 'nextMatch')
      .where('nextMatch.createdAt < DATE_SUB(now(), INTERVAL 5 SECOND)')
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

  //TODO 5 second!!!
  // Force canceled match if the match in status CATEGORY_CHOOSE continious more than 5 second from createdAt
  @Cron(CronExpression.EVERY_5_SECONDS)
  async canceledMatches(): Promise<void> {
    const matchesToUpdate = await this._matchRepository
      .createQueryBuilder('match')
      .where('match.createdAt < DATE_SUB(now(), INTERVAL 5 MINUTE)')
      .andWhere('match.status = :status', {
        status: MatchStatusType.CATEGORY_CHOOSE,
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
  @Cron(CronExpression.EVERY_5_SECONDS)
  async endMatches(): Promise<void> {
    const matchesToUpdate = await this._matchRepository
      .createQueryBuilder('match')
      .where('match.startedAt < DATE_SUB(now(), INTERVAL 2 MINUTE)')
      .andWhere('match.status = :status', {
        status: MatchStatusType.IN_PROCESS,
      })
      .getMany();

    matchesToUpdate.map(async (match) => {
      const endedMatchData = await this._matchRepository.findOne({
        where: { id: match.id, status: MatchStatusType.IN_PROCESS },
        relations: [
          'users',
          'users.statistics',
          'questions',
          'questions.correctAnswer',
          'questions.answers',
        ],
      });
      const matchUserAnswers = await this._userAnswerRepository.find({
        where: {
          match: { id: match.id },
        },
        relations: ['user'],
      });

      if (!match.botName) {
        await this._matchService.finishMatchWithRealOpponent(
          endedMatchData,
          matchUserAnswers,
        );
      } else {
        await this._matchService.finishMatchWithBot(
          endedMatchData,
          matchUserAnswers,
        );
      }
    });
  }

  // add tiket, after 15 minutes, when match ended
  @OnEvent('task.trigger')
  handleTaskTrigger(users: UserEntity[]): void {
    const fifteenMinutesFromNow = new Date(Date.now() + 15 * 1000 * 60);

    schedule.scheduleJob(fifteenMinutesFromNow, async () => {
      for (const user of users) {
        let tickets = user.tickets;
        if (tickets < 5) {
          ++tickets;
          // update user.tikets in db
          await this._userService.updateUser(user.id, { tickets });
        }
        // await this._matchGateway.sendUserData({ ...user, tickets });
      }
    });
  }

  // To remove matches from DB if Matchstatus is CANCELED
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async removeCanceledMatches(): Promise<void> {
    const matches = await this._matchRepository.find({
      where: {
        status: MatchStatusType.CANCELED,
      },
      relations: ['previousMatch', 'categories'],
    });

    for (const match of matches) {
      if (match.previousMatch) {
        await this._matchRepository.update(match.previousMatch.id, {
          nextMatch: null,
        });
      }

      await this._matchRepository.delete(match.id);
    }
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async checkLanguages(): Promise<void> {
    const languages = await this._languagesService.findAll();

    for (const language of languages) {
      if (!LANGUAGES.has(language.key)) {
        LANGUAGES.add(language.key);
      }
    }
  }

  async onModuleInit(): Promise<void> {
    await this.checkLanguages();
  }
}
