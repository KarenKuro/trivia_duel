import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { omit } from 'lodash';
import { Server, Socket } from 'socket.io';

import { MatchEntity, UserEntity } from '@common/database/entities';
import { ITokenPayload } from '@common/models';

import { BonusesDTO } from './dto';

@WebSocketGateway(3001)
export class MatchGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    public readonly jwtService: JwtService,
    public readonly configService: ConfigService,
  ) {}

  private clients: Set<Socket> = new Set();

  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    try {
      const accessToken = client.handshake.headers.bearer?.toString();
      await this.jwtService.verify(accessToken);
      const payload = this.jwtService.decode(accessToken) as ITokenPayload;

      const userId = payload.id;
      console.log('userId', userId);

      client.join(userId.toString());

      this.clients.add(client);
      console.log(`Client connected: ${client?.id}`);
    } catch (error) {
      console.log('socket error', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.clients.delete(client);
  }

  async sendMessageToHandlers(match: MatchEntity): Promise<void> {
    try {
      console.log(
        'GONNA BROADCAST match',
        match.id,
        match.status,
        match.lastAnswer?.id,
      );
      let users: UserEntity[] = [];
      users = [...match.users];

      if (match.winner) {
        match.winner = { id: match.winner.id } as UserEntity;
      } else {
        match.winner = null;
      }

      match = omit(match, ['users']) as MatchEntity;
      users.map((user) => {
        this.server.to(user.id.toString()).emit('message', match);
      });
    } catch (e) {
      console.log(e);
    }
  }

  // this method will be needed if the user needs to receive a notification that tickets have been added to him
  // async sendUserData(user: UserEntity) {
  //   this.server.to(user.id.toString()).emit('user', user);
  // }

  async sendBonusesAfterMatch(bonuses: BonusesDTO) {
    try {
      this.server.to(bonuses.userId.toString()).emit('bonuses', bonuses);
    } catch (e) {
      console.log(e);
    }
  }
}
