import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Chat } from 'src/common/entities/chat.entity';
import { ChatMessageLike } from 'src/common/entities/chatMessageLike.entity';
import { ChatMessageReader } from 'src/common/entities/chatMessageReader.entity';
import { Message } from 'src/common/entities/message.entity';
import { User } from 'src/common/entities/user.entity';
import { MessageResponse } from 'src/common/types/message/message.type';
import { CreateMessageDto } from 'src/modules/chat/dto/create-message.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,

    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
  ) {}

  async getMessages(chatId: string): Promise<MessageResponse[]> {
    try {
      const messages = await this.messageRepository
        .createQueryBuilder('message')
        .leftJoinAndSelect('message.owner', 'owner')
        .leftJoinAndSelect('message.readers', 'readers')
        .leftJoinAndSelect('message.likes', 'likes')
        .leftJoinAndSelect('likes.user', 'likeUser')
        .leftJoinAndSelect('readers.user', 'user')
        .leftJoinAndSelect('message.chat', 'chat')
        .leftJoinAndSelect('chat.members', 'members')
        .where('message.chat.id = :chatId', { chatId })
        .getMany();

      const response: MessageResponse[] = messages.map((message) => {
        const chatMembers = message.chat.members;
        const isReadBy = chatMembers.map((member) => {
          const isRead = message.readers.some(
            (reader) => reader.user.id === member.id,
          );
          return {
            messageId: message.id,
            userId: member.id,
            isRead: isRead || false,
          };
        });

        const likes = chatMembers.map((member) => {
          const like = message.likes
            ? message.likes.find((likeItem) => likeItem.user.id === member.id)
            : undefined;

          return {
            messageId: message.id,
            userId: member.id,
            like: like ? like.like : '0',
          };
        });

        return {
          id: message.id,
          createdAt: message.createdAt,
          content: message.content,
          chat: message.chat,
          owner: {
            id: message.owner.id,
            firstName: message.owner.firstName,
            lastName: message.owner.lastName,
            isDeleted: message.owner.isDeleted,
          },
          isReadBy,
          likes,
        };
      });

      return response;
    } catch (error) {
      throw new Error('Failed to fetch messages');
    }
  }

  async createMessage(
    createMessageDto: CreateMessageDto,
    userId: string,
  ): Promise<Message> {
    try {
      const message = this.messageRepository.create({
        ...createMessageDto,
        chat: { id: createMessageDto.chatId },
        owner: { id: userId },
      });

      const newMessage = await this.messageRepository.save(message);

      await this.updateChatUpdatedAt(createMessageDto.chatId);
      await this.markMessageAsRead(newMessage.id, userId);

      return await this.messageRepository.findOne({
        where: { id: newMessage.id },
        relations: ['owner', 'chat', 'chat.members'],
      });
    } catch (error) {
      throw new Error('Failed to create message');
    }
  }

  private async updateChatUpdatedAt(chatId: string): Promise<void> {
    try {
      await this.chatRepository
        .createQueryBuilder()
        .update(Chat)
        .set({ updatedAt: new Date() })
        .where('id = :chatId', { chatId })
        .execute();
    } catch (error) {
      throw new Error('Failed to update chat updatedAt');
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const userChats = await this.chatRepository
        .createQueryBuilder('chat')
        .leftJoinAndSelect('chat.members', 'member', 'member.id = :userId', {
          userId,
        })
        .where('member.id IS NOT NULL')
        .getMany();

      const unreadCountsPromises = userChats.map(async (chat) => {
        const unreadCountInChat = await this.messageRepository
          .createQueryBuilder('message')
          .leftJoinAndSelect(
            'message.readers',
            'reader',
            'reader.user = :userId',
            { userId },
          )
          .where('reader.id IS NULL')
          .andWhere('message.chat = :chatId', { chatId: chat.id })
          .getCount();

        return unreadCountInChat;
      });

      const unreadCounts = await Promise.all(unreadCountsPromises);
      const totalUnreadCount = unreadCounts.reduce(
        (sum, count) => sum + count,
        0,
      );

      return totalUnreadCount;
    } catch (error) {
      throw new Error('Failed to fetch unread message count');
    }
  }

  async getUnreadCountByChatId(
    userId: string,
    chatId: string,
  ): Promise<number> {
    try {
      const unreadCount = await this.messageRepository
        .createQueryBuilder('message')
        .leftJoinAndSelect(
          'message.readers',
          'reader',
          'reader.user = :userId',
          { userId },
        )
        .leftJoin('message.chat', 'chat')
        .leftJoin('chat.members', 'member', 'member.id = :userId', {
          userId,
        })
        .andWhere('reader.id IS NULL')
        .andWhere('chat.id = :chatId', { chatId })
        .andWhere('member.id IS NOT NULL')
        .getCount();

      return unreadCount;
    } catch (error) {
      throw new Error('Failed to fetch unread message count by chat');
    }
  }

  async markMessageAsRead(
    messageId: string,
    userId: string,
  ): Promise<{ members: string[]; chatId: string }> {
    try {
      const message = await this.messageRepository.findOne({
        where: { id: messageId },
        relations: ['readers', 'chat', 'chat.members', 'readers.user'],
      });

      if (!message) {
        throw new NotFoundException('Message not found');
      }

      const user = await User.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }
      const isAlreadyRead = message.readers.some(
        (reader) => reader.user.id === userId && reader.isRead,
      );

      if (!isAlreadyRead) {
        const reader = new ChatMessageReader();
        reader.isRead = true;
        reader.user = user;
        reader.message = message;

        message.readers.push(reader);

        await this.messageRepository.save(message);

        const chats = await this.chatRepository.find({
          where: { id: message.chat.id },
          relations: ['members'],
        });

        const userIds = chats.reduce((allUserIds, chat) => {
          allUserIds.push(...chat.members.map((member) => member.id));
          return allUserIds;
        }, []);

        return {
          members: userIds,
          chatId: chats[0].id,
        };
      }
    } catch (error) {
      throw new Error(`Failed to mark message as read: ${error.message}`);
    }
  }

  async setLike(
    messageId: string,
    like: string,
    userId: string,
  ): Promise<{ members: string[]; chatId: string }> {
    try {
      const message = await this.messageRepository.findOne({
        where: { id: messageId },
        relations: ['likes', 'chat', 'chat.members', 'likes.user'],
      });

      if (!message) {
        throw new NotFoundException('Message not found');
      }

      const user = await User.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }
      const isAlreadyWithLike = message.likes.some(
        (item) => item.user.id === userId && item.like,
      );

      if (!isAlreadyWithLike) {
        const messageLike = new ChatMessageLike();
        messageLike.like = like;
        messageLike.user = user;
        messageLike.message = message;
        message.likes.push(messageLike);
      } else {
        message.likes.find((item) => item.user.id === userId).like = like;
      }
      await this.messageRepository.save(message);

      const chats = await this.chatRepository.find({
        where: { id: message.chat.id },
        relations: ['members'],
      });

      const userIds = chats.reduce((allUserIds, chat) => {
        allUserIds.push(...chat.members.map((member) => member.id));
        return allUserIds;
      }, []);

      return {
        members: userIds,
        chatId: chats[0].id,
      };
    } catch (error) {
      throw new Error(`Failed to set like for the message: ${error.message}`);
    }
  }
}
