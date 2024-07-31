import { MatchEntity } from '@common/database/entities';
import { ITokenPayload } from '@common/models';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { omit } from 'lodash';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(3001)
export class MatchGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    public readonly jwtService: JwtService,
    public readonly configService: ConfigService,
  ) {}

  private clients: Set<Socket> = new Set();

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    console.log('WebSocket Gateway initialized', server);
  }

  async handleConnection(client: Socket) {
    // let { token: accessToken } = client.handshake.auth;
    // console.log(client.handshake);

    // if (!accessToken) {
    const accessToken = client.handshake.headers.bearer.toString();
    // if (accessToken) {
    //   accessToken = accessToken.split(' ').reverse()[0];
    // }
    // }
    try {
      await this.jwtService.verify(accessToken);
      const payload = this.jwtService.decode(accessToken) as ITokenPayload;

      const userId = payload.id;

      console.log('userId', userId);

      client.join(userId.toString());
      // console.log(client);

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
      let users = [];
      users = [...match.users];

      match = omit(match, ['users']) as MatchEntity;
      users.forEach((user) => {
        this.server.to(user.id.toString()).emit('message', match);
      });
    } catch (e) {
      console.log(e);
    }
  }
}
