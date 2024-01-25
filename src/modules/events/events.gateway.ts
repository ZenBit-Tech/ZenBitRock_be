/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */
/* eslint-disable import/no-cycle */
import {
  BadRequestException,
  Inject,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
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
import { ChatEvent } from 'src/common/enums';
import { SocketWithAuth, TokenPayload } from 'src/common/types';
import { MAX_RETRIES, RETRY_DELAY } from 'src/common/constants';
import { MessageResponse } from 'src/common/types/message/message.type';

@WebSocketGateway({ cors: { origin: '*' } })
class EventsGateway implements OnGatewayInit, OnGatewayConnection {
  private readonly logger = new Logger(EventsGateway.name);
  private queue: (() => void)[] = [];
  private isQueueRunning: boolean = false;

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

    server.use(async (socket: SocketWithAuth, next) => {
      try {
        const token =
          socket.handshake.auth.token || socket.handshake.headers.token;

        await this.pingDb();

        const { id, email } = this.jwtService.verify<TokenPayload>(token);

        const crendetialsInvalid = !id || !email;

        if (crendetialsInvalid) {
          next(new UnauthorizedException('Invalid credentials'));
        }

        const user = await this.userService.findOneById(id);

        if (!user) {
          next(new BadRequestException("User doesn't exist!"));
        }

        socket.userId = id;
        socket.userEmail = email;

        socket.prependAny(async () => {
          await this.handleSocketEvent(this.pingDb.bind(this));
          socket.emit('db_pinged');
        });

        next();
      } catch (error) {
        next(error);
      }
    });
  }

  async handleQueue(handler: () => Promise<void>) {
    this.isQueueRunning = true;
    await handler();

    while (this.queue.length > 0) {
      this.queue.shift()();
    }
    this.isQueueRunning = false;
  }

  async handleSocketEvent(handler: () => Promise<void>) {
    if (!this.isQueueRunning) {
      this.handleQueue(handler);
    } else {
      this.queue.push(handler);
    }
  }

  async handleConnection(client: SocketWithAuth): Promise<void> {
    client.join(client.userId);
    const chatList = await this.userService.getChatsByUser(client.userId);
    if (chatList) {
      chatList.forEach((chat) => {
        client.join(chat.id);
      });
    }
    if (chatList) {
      chatList.forEach((chat) => {
        client.join(chat.id);
      });
    }
  }

  async addToRoom(userId: string, chatId: string): Promise<void> {
    const sockets = await this.server.in(userId).fetchSockets();
    sockets.forEach((socket) => socket.join(chatId));
  }

  async pingDb(): Promise<void> {
    let attemptCount = 0;
    let isRetrySuccessful = false;

    while (attemptCount < MAX_RETRIES && !isRetrySuccessful) {
      try {
        await this.userService.findOne('ping');
        isRetrySuccessful = true;
      } catch (error) {
        console.error(error);
        attemptCount++;
        await new Promise((res) => setTimeout(res, RETRY_DELAY));
      }
    }
  }

  @SubscribeMessage(ChatEvent.RequestAllMessages)
  async getAllMessages(
    @MessageBody() { chatId }: { chatId: string },
  ): Promise<MessageResponse[]> {
    await this.pingDb();
    return await this.messageService.getMessages(chatId);
  }

  @SubscribeMessage('join')
  handleJoin(client: SocketWithAuth, data: { chatId: string }): string {
    const { chatId } = data;

    client.join(chatId.toString());
    return chatId;
  }

  @SubscribeMessage('leave')
  handleLeave(client: SocketWithAuth, data: { chatId: string }): string {
    const { chatId } = data;

    client.leave(chatId.toString());
    return chatId;
  }

  @SubscribeMessage(ChatEvent.NewMessage)
  async handleMessage(
    client: SocketWithAuth,
    createMessageDto: CreateMessageDto,
  ): Promise<void> {
    await this.handleSocketEvent(async () => {
      try {
        const { userId } = client;

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

          const userIds = Array.from(
            new Set(message.chat.members.map((user) => user.id)),
          );

          userIds.forEach((id) =>
            this.server
              .to(id)
              .emit(ChatEvent.RequestUnreadMessagesCountUpdated),
          );
        } else {
          client.emit('errorMessage', { message: 'Not a chat  member' });
        }
      } catch (error) {
        client.emit('errorMessage', {
          message: `An error occurred ${error ? error : ''}`,
        });
      }
    });
  }

  @SubscribeMessage(ChatEvent.RequestAllChats)
  async getAllChats(
    client: SocketWithAuth,
    data: ChatsByUserDto,
  ): Promise<Chat[]> {
    try {
      const { userId } = client;
      return await this.userService.getChatsByUserWithMessages(data, userId);
    } catch (error) {
      throw error;
    }
  }

  @SubscribeMessage(ChatEvent.RequestUnreadMessagesCount)
  async getUnreadCount(client: SocketWithAuth): Promise<number> {
    try {
      const { userId } = client;
      const unreadCount = await this.messageService.getUnreadCount(userId);

      return unreadCount;
    } catch (error) {
      client.emit('errorMessage', { message: 'An error occurred' });
    }
  }

  @SubscribeMessage(ChatEvent.RequestUnreadMessagesByIdCount)
  async getUnreadCountByChatId(
    client: SocketWithAuth,
    chatId: string,
  ): Promise<number> {
    try {
      const { userId } = client;
      const unreadCount = await this.messageService.getUnreadCountByChatId(
        userId,
        chatId,
      );

      return unreadCount;
    } catch (error) {
      client.emit('errorMessage', { message: 'An error occurred' });
    }
  }

  @SubscribeMessage(ChatEvent.RequestMarkAsRead)
  async markMessagesAsRead(
    client: SocketWithAuth,
    data: { messageId: string; chatId: string },
  ): Promise<void> {
    try {
      const { userId } = client;
      const { messageId } = data;

      const forUsers = await this.messageService.markMessageAsRead(
        messageId,
        userId,
      );
      forUsers.forEach((id) =>
        this.server.to(id).emit(ChatEvent.RequestUnreadMessagesCountUpdated),
      );

      this.server.to(userId).emit(ChatEvent.RequestUnreadMessagesCountUpdated);
    } catch (error) {
      client.emit('errorMessage', { message: 'An error occurred' });
    }
  }
}

export { EventsGateway };
