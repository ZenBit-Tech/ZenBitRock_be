import { Inject, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server } from 'socket.io';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { ChatEvent } from 'src/common/enums';
import { Message } from 'src/common/entities/message.entity';
import { SocketWithAuth, TokenPayload } from 'src/common/types';
import { CreateMessageDto } from '../chat/dto/create-message.dto';
import { MessageService } from '../chat/services/message.service';
import { UserService } from '../user/user.service';
import { ChatService } from '../chat/services/chat.service';

@WebSocketGateway({ cors: { origin: '*' } })
class EventsGateway implements OnGatewayInit, OnGatewayConnection {
  private readonly logger = new Logger(EventsGateway.name);
  @Inject()
  private jwtService: JwtService;
  @Inject()
  private userService: UserService;
  @Inject()
  private messageService: MessageService;
  @Inject()
  private chatService: ChatService;

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    this.logger.log('Gateway initialized');
    server.use((socket: SocketWithAuth, next) => {
      try {
        const token =
          socket.handshake.auth.token || socket.handshake.headers['token'];

        const { id, email } = this.jwtService.verify<TokenPayload>(token);

        const crendetialsInvalid = !id || !email;

        if (crendetialsInvalid) {
          next(new UnauthorizedException('Invalid credentials'));
        }

        socket.userId = id;
        socket.userEmail = email;

        next();
      } catch (error) {
        next(error);
      }
    });
  }

  async handleConnection(client: SocketWithAuth): Promise<void> {
    client.join(client.userId);
    const chatList = await this.userService.getChatsByUser(client.userId);
    chatList.forEach((chat) => {
      client.join(chat.id);
    });
  }

  async addToRoom(userId: string, chatId: string): Promise<void> {
    const sockets = await this.server.in(userId).fetchSockets();
    sockets.forEach((socket) => socket.join(chatId));
  }

  @SubscribeMessage(ChatEvent.RequestAllMessages)
  async getAllMessages(@MessageBody() chatId: string): Promise<Message[]> {
    return await this.messageService.getMessages(chatId);
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

  @SubscribeMessage(ChatEvent.NewMessage)
  async handleMessage(
    client: SocketWithAuth,
    createMessageDto: CreateMessageDto,
  ): Promise<void> {
    try {
      const userId = client.userId;

      const isMember = await this.chatService.checkUserisChatMember(
        createMessageDto.chatId,
        userId,
      );

      if (isMember) {
        const message = await this.messageService.createMessage(
          createMessageDto,
          userId,
        );

        this.server.to(message.chat.id).emit(ChatEvent.NewMessage, message);
      } else {
        client.emit('errorMessage', { message: 'Not a chat  member' });
      }
    } catch (error) {
      client.emit('errorMessage', { message: 'An error occurred' });
    }
  }
}
export { EventsGateway };
