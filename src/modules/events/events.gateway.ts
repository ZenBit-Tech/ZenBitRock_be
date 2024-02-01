/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */
/* eslint-disable import/no-cycle */
import {
  BadRequestException,
  Inject,
  Logger,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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
import { NotificationService } from 'modules/notification';
import { Chat, User, Notification } from 'src/common/entities';
import { ChatEvent, NotificationType } from 'src/common/enums';

import {
  NotificationPayload,
  SocketWithAuth,
  TokenPayload,
} from 'src/common/types';

import { MessageResponse } from 'src/common/types/message/message.type';

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

  @Inject(forwardRef(() => NotificationService))
  private notificationService: NotificationService;

  @WebSocketServer()
  server: Server;

  afterInit(server: Server): void {
    this.logger.log('Gateway initialized');

    server.use(async (socket: SocketWithAuth, next) => {
      try {
        const token =
          socket.handshake.auth.token || socket.handshake.headers.token;

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

        next();
      } catch (error) {
        next(error);
      }
    });
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

  async sendNotification(payload: NotificationPayload) {
    try {
      const notification = await this.notificationService.create(payload);

      payload.recipients.forEach((recipient) => {
        this.server.to(recipient).emit(ChatEvent.NewNotification, notification);
      });
    } catch (error) {
      console.error(error);
    }
  }

  async handleChatUpdate(
    newMemberIds: string[],
    oldMembers: User[],
    chat: Chat,
  ): Promise<void> {
    const { id: chatId, members } = chat;

    const newMembers = newMemberIds.filter(
      (memberId) => !oldMembers.find((member) => member.id === memberId),
    );

    const deletedMembers = oldMembers.filter(
      (member) => !newMemberIds.find((memberId) => memberId === member.id),
    );

    if (deletedMembers.length) {
      await this.handleChatMembersDeletion(deletedMembers, chat);
    }

    if (newMembers.length) {
      for (const member of newMembers) {
        await this.addToRoom(member, chatId);
      }

      const users = await this.userService.findAllByIds(newMembers);

      let notificationMessage = '';
      users.forEach((user) => {
        notificationMessage = notificationMessage.concat(
          `${user.firstName} ${user.lastName} , `,
        );
      });

      notificationMessage = notificationMessage.substring(
        0,
        notificationMessage.lastIndexOf(','),
      );

      notificationMessage = notificationMessage.concat(
        `${newMembers.length === 1 ? 'was' : 'were'} added to ${chat.title}`,
      );

      await this.sendNotification({
        text: notificationMessage,
        type: NotificationType.UserAddedToChat,
        recipients: members.map((member) => member.id),
      });
    }
  }

  async handleChatMembersDeletion(deletedMembers: User[], chat: Chat) {
    const { id: chatId, title } = chat;
    deletedMembers.forEach(async (member) => {
      const sockets = await this.server.in(member.id).fetchSockets();
      sockets.forEach((socket) => socket.leave(chatId));
    });

    let notificationMessage = '';
    deletedMembers.forEach((user) => {
      notificationMessage = notificationMessage.concat(
        `${user.firstName} ${user.lastName} , `,
      );
    });

    notificationMessage = notificationMessage.substring(
      0,
      notificationMessage.lastIndexOf(','),
    );

    notificationMessage = notificationMessage.concat(
      `${deletedMembers.length === 1 ? 'was' : 'were'} removed from ${title}`,
    );

    await this.sendNotification({
      text: notificationMessage,
      type: NotificationType.UserRemovedFromChat,
      recipients: deletedMembers.map((member) => member.id),
    });
  }

  @SubscribeMessage(ChatEvent.RequestAllMessages)
  async getAllMessages(
    @MessageBody() { chatId }: { chatId: string },
  ): Promise<MessageResponse[]> {
    return await this.messageService.getMessages(chatId);
  }

  @SubscribeMessage(ChatEvent.RequestAllNotifications)
  async getAllNotifications(
    @MessageBody() { userId }: { userId: string },
  ): Promise<Notification[]> {
    return await this.notificationService.findNotificationsByUserId(userId);
  }

  @SubscribeMessage(ChatEvent.RequestNewNotificationsCount)
  async getNewNotificationsCount(
    @MessageBody() { userId }: { userId: string },
  ): Promise<number> {
    return await this.notificationService.findNewNotificationsCount(userId);
  }

  @SubscribeMessage(ChatEvent.DeleteNotificationToUser)
  async deleteNotificationToUser(
    @MessageBody()
    { notificationId, userId }: { notificationId: string; userId: string },
  ): Promise<boolean> {
    return Boolean(
      await this.notificationService.deleteToUser(notificationId, userId),
    );
  }

  @SubscribeMessage(ChatEvent.NotificationMarkAsRead)
  async notificationMarkAsRead(
    @MessageBody()
    { notificationId, userId }: { notificationId: string; userId: string },
  ): Promise<boolean> {
    return Boolean(
      await this.notificationService.markAsRead(notificationId, userId),
    );
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
        userIds
          .filter((user) => user !== userId)
          .forEach((id) => {
            this.server
              .to(id)
              .emit(
                ChatEvent.RequestUnreadMessagesCountUpdated,
                message.chat.id,
              );
            this.server
              .to(id)
              .emit(ChatEvent.RequestUnreadMessagesCountUpdated);
          });
      } else {
        client.emit('errorMessage', { message: 'Not a chat  member' });
      }
    } catch (error) {
      client.emit('errorMessage', {
        message: `An error occurred ${error || ''}`,
      });
    }
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
    data: { messageId: string },
  ): Promise<void> {
    try {
      const { userId } = client;
      const { messageId } = data;
      const { members, chatId } = await this.messageService.markMessageAsRead(
        messageId,
        userId,
      );
      members.forEach((member) => {
        this.server
          .to(member)
          .emit(ChatEvent.RequestUnreadMessagesCountUpdated, chatId);
        this.server
          .to(member)
          .emit(ChatEvent.RequestUnreadMessagesCountUpdated);
      });
    } catch (error) {
      client.emit('errorMessage', {
        message: 'An error occurred in controller',
      });
    }
  }
}

export { EventsGateway };
