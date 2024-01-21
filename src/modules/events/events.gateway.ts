/* eslint-disable class-methods-use-this */
/* eslint-disable import/no-cycle */
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

import { Server } from 'socket.io';

import { ChatsByUserDto } from 'modules/chat/dto/chats-by-user.dto';
import { CreateMessageDto } from 'modules/chat/dto/create-message.dto';
import { ChatService } from 'modules/chat/services/chat.service';
import { MessageService } from 'modules/chat/services/message.service';
import { UserService } from 'modules/user/user.service';
import { Chat } from 'src/common/entities/chat.entity';
import { Message } from 'src/common/entities/message.entity';
import { ChatEvent } from 'src/common/enums';
import { SocketWithAuth, TokenPayload } from 'src/common/types';

import { CreateMessageDto } from '../chat/dto/create-message.dto';
import { MessageService } from '../chat/services/message.service';
import { UserService } from '../user/user.service';

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

  afterInit(server: Server): void {
    this.logger.log('Gateway initialized');
    server.use((socket: SocketWithAuth, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.token;
        const token =
          socket.handshake.auth.token || socket.handshake.headers.token;

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
  @SubscribeMessage('ping')
  handleEvent(@MessageBody() data: string): string {
    return `${data} pong`;
  }

  @SubscribeMessage('join')
  handleJoin(client: SocketWithAuth, data: { chatId: string }): string {
    const { chatId } = data;
    const { chatId } = data;

    client.join(chatId.toString());
    return chatId;
  }

  @SubscribeMessage('leave')
  handleLeave(client: SocketWithAuth, data: { chatId: string }): string {
    const { chatId } = data;
    const { chatId } = data;

    client.leave(chatId.toString());
    return chatId;
  }

  @SubscribeMessage(ChatEvent.NewMessage)
  async handleMessage(
    client: SocketWithAuth,
    createMessageDto: CreateMessageDto,
  ): Promise<void> {
    try {
      const { userId } = client;

      const isMember = await this.chatService.checkUserisChatMember(
        createMessageDto.chatId,
        userId,
      );
      const { userId } = client;

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

  @SubscribeMessage(ChatEvent.RequestAllChats)
  async getAllChats(@MessageBody() data:ChatsByUserDto):
   Promise<Chat[]> {
    try {
      const chats = await this.userService.getChatsByUserWithMessages(data);
      return chats;
    } catch (error) {
      throw error;
    }
  }

  @SubscribeMessage('getUnreadMessagesByChatId')
  async getUnreadMessagesByChatId(
    client: SocketWithAuth,
    data: { chatId: string },
  ): Promise<void> {
    try {
      const { userId } = client;
      const { chatId } = data;

      const unreadMessages =
        await this.messageService.getUnreadMessagesByChatId(userId, chatId);

      client.emit('unreadMessagesByChatId', unreadMessages);
    } catch (error) {
      client.emit('errorMessage', { message: 'An error occurred' });
    }
  }

  @SubscribeMessage('getUnreadCount')
  async getUnreadCount(client: SocketWithAuth): Promise<void> {
    try {
      const { userId } = client;
      const unreadCount = await this.messageService.getUnreadCount(userId);

      client.emit('unreadCount', unreadCount);
    } catch (error) {
      client.emit('errorMessage', { message: 'An error occurred' });
    }
  }

  @SubscribeMessage('getUnreadCountByChatId')
  async getUnreadCountByChatId(
    client: SocketWithAuth,
    data: { chatId: string },
  ): Promise<void> {
    try {
      const { userId } = client;
      const { chatId } = data;

      const unreadCount = await this.messageService.getUnreadCountByChatId(
        userId,
        chatId,
      );

      client.emit('unreadCountByChatId', { chatId, unreadCount });
    } catch (error) {
      client.emit('errorMessage', { message: 'An error occurred' });
    }
  }

  @SubscribeMessage('markAsRead')
  async markMessagesAsRead(
    client: SocketWithAuth,
    data: { messageId: string; chatId: string },
  ): Promise<void> {
    try {
      const { userId } = client;
      const { messageId, chatId } = data;

      await this.messageService.markMessageAsRead(messageId, userId, chatId);

      const unreadCount = await this.messageService.getUnreadCount(userId);
      client.emit('unreadCount', unreadCount);
    } catch (error) {
      client.emit('errorMessage', { message: 'An error occurred' });
    }
  }
}
export { EventsGateway };
