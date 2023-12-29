import { Inject, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server } from 'socket.io';
import { MessageBody, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, } from '@nestjs/websockets';

import { SocketWithAuth, TokenPayload } from 'src/common/types';
import { MessageService } from '../message/message.service';
import { CreateMessageDto } from '../message/dto/create-message.dto';

@WebSocketGateway({ cors: { origin: '*' } })
class EventsGateway implements OnGatewayInit {
  private readonly logger = new Logger(EventsGateway.name);
  @Inject()
  private jwtService: JwtService;
  @Inject()
  private messageService: MessageService;

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

  @SubscribeMessage('join')
  handleJoin(client: SocketWithAuth, data: { roomId: string }): string {
    const roomId = data.roomId;

    client.join(roomId.toString());
    return roomId;
  }

  @SubscribeMessage('leave')
  handleLeave(client: SocketWithAuth, data: { roomId: string }): string {
    const roomId = data.roomId;

    client.leave(roomId.toString());
    return roomId;
  }

  @SubscribeMessage('message')
  async handleMessage(
    client: SocketWithAuth,
    createMessageDto: CreateMessageDto,
  ): Promise<void> {
    try {
      const userId = client.userId;

      const message = await this.messageService.createMessage(
        createMessageDto,
        userId,
      );

      client.emit('message', message);
      client.to(message.room.toString()).emit('message', message);
    } catch (error) {
      client.emit('errorMessage', { message: 'An error occurred' });
    }
  }
}
export { EventsGateway };
