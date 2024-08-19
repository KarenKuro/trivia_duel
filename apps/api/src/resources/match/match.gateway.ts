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

import { MatchEntity } from '@common/database/entities';
import { ITokenPayload, IUser } from '@common/models';

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
    const accessToken = client.handshake.headers.bearer.toString();

    try {
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
      let users: IUser[] = [];
      users = [...match.users];

      // TODO не стоит ли добавить сюда хотя бы какую то инфу о юзере? чтобы перед началом матча показать инфу о юзере
      // или лучше создать отдельный метод, для момента начала матча?
      match = omit(match, ['users']) as MatchEntity;
      users.map((user) => {
        this.server.to(user.id.toString()).emit('message', match);
      });
    } catch (e) {
      console.log(e);
    }
  }
}
