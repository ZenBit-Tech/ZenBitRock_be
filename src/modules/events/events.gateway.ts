import { Inject, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server } from 'socket.io';
import { MessageBody, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, } from '@nestjs/websockets';

import { SocketWithAuth, TokenPayload } from 'src/common/types';
import { CreateMessageDto } from '../chat/dto/create-message.dto';
import { MessageService } from '../chat/services/message.service';

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
  handleJoin(client: SocketWithAuth, data: { chatId: string }): string {
    const chatId = data.chatId;

    client.join(chatId.toString());
    return chatId;
  }

  @SubscribeMessage('leave')
  handleLeave(client: SocketWithAuth, data: { chatId: string }): string {
    const chatId = data.chatId;

    client.leave(chatId.toString());
    return chatId;
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
      client.to(message.chat.toString()).emit('message', message);
    } catch (error) {
      client.emit('errorMessage', { message: 'An error occurred' });
    }
  }
}
export { EventsGateway };
