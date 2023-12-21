import { Inject, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server } from 'socket.io';
import { SocketWithAuth, TokenPayload } from 'src/common/types';

@WebSocketGateway({ cors: { origin: '*' } })
class EventsGateway implements OnGatewayInit {
  private readonly logger = new Logger(EventsGateway.name);
  @Inject()
  private jwtService: JwtService;

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    this.logger.log('Gateway initialized');
    server.use((socket: SocketWithAuth, next) => {
      try {
        const token =
          socket.handshake.auth.token || socket.handshake.headers['token'];

        const { id, email } = this.jwtService.verify<TokenPayload>(token);

        socket.userId = id;
        socket.userEmail = email;

        next();
      } catch (error) {
        next(error);
      }
    });
  }

  @SubscribeMessage('ping')
  handleEvent(@MessageBody() data: string): string {
    return data + ' pong';
  }
}
export { EventsGateway };
