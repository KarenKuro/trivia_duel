import { MatchEntity, UserEntity } from '@common/database/entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { MatchGateway } from './match.gateway';
import { IUserId } from '@common/models/common/user-id';
import { IMatch } from '@common/models';
import { MatchStatusType } from '@common/enums';
import { MatchHelpers, ResponseManager } from '@common/helpers';
import { ERROR_MESSAGES } from '@common/messages';

@Injectable()
export class MatchService {
  constructor(
    @InjectRepository(MatchEntity)
    private readonly _matchRepository: Repository<MatchEntity>,

    @InjectRepository(UserEntity)
    private readonly _userRepository: Repository<UserEntity>,

    private readonly _matchGateway: MatchGateway,
  ) {}

  async createOrJoinMatch(userPayload: IUserId): Promise<IMatch> {
    const user = await this._userRepository.findOne({
      where: { id: userPayload.id },
    });

    const currMatch = await this._matchRepository.findOne({
      where: {
        users: {
          id: user.id,
        },
        status: In([
          MatchStatusType.IN_PROCESS,
          MatchStatusType.CATEGORE_CHOOSE,
          MatchStatusType.PENDING,
        ]),
      },
    });

    if (currMatch) {
      throw ResponseManager.buildError(ERROR_MESSAGES.USER_ALREADY_IN_MATCH);
    }

    const matchLevel = MatchHelpers.getLevel(user.level);

    const match = await this._matchRepository.findOne({
      where: {
        matchLevel,
        status: MatchStatusType.PENDING,
      },
      relations: ['users'],
    });

    let newMatch: MatchEntity;
    if (match && match.users.length !== 2) {
      const users = match.users;
      users.push(user);

      match.users = users;

      const newStatus = MatchStatusType.CATEGORE_CHOOSE;
      match.status = newStatus;

      newMatch = await this._matchRepository.save(match);
    } else {
      newMatch = await this._matchRepository.save({
        users: [user],
        matchLevel,
      });
    }

    this._matchGateway.sendMessageToHandlers(newMatch);

    return newMatch; //++++++++++++++++++++++++Крон джоб, чтобы юзер не ждал больше 10 секунд
  }

  async answer(id: number, userId: number, body: any) {
    // Database kpahe useri answery
    // lastAnswery kpoxe or exni weronshyal asnwery
    // u socketow kjampe matchy(nerqewi gracy)

    const match = await this.getMatchDataToSend(id);
    this._matchGateway.sendMessageToHandlers(match);
  }

  async getMatchDataToSend(id: number): Promise<MatchEntity> {
    const match = await this._matchRepository.findOne({
      where: {
        id,
      },
      relations: [
        'users',
        'lastAnswer',
        'lastAnswer.user',
        'lastAnswer.question',
        'lastAnswer.answer',
      ],
    });

    return match;
  }
}
