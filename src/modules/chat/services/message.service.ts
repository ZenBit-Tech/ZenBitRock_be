import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Chat } from 'src/common/entities/chat.entity';
import { ChatMessageReader } from 'src/common/entities/chatMessageReader.entity';
import { Message } from 'src/common/entities/message.entity';
import { User } from 'src/common/entities/user.entity';
import { MessageResponse } from 'src/common/types/message/message.type';

import { CreateMessageDto } from '../dto/create-message.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,

    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
  ) {}

  async getMessages(
    chatId: string,
    userId: string,
  ): Promise<MessageResponse[]> {
    try {
      const messages = await this.messageRepository
        .createQueryBuilder('message')
        .leftJoinAndSelect('message.owner', 'owner')
        .leftJoinAndSelect('message.readers', 'readers')
        .leftJoinAndSelect('readers.user', 'user')
        .where('message.chat.id = :chatId', { chatId })
        .getMany();
      const response: MessageResponse[] = messages.map((message) => ({
        id: message.id,
        createdAt: message.createdAt,
        content: message.content,
        owner: {
          id: message.owner.id,
          firstName: message.owner.firstName,
          lastName: message.owner.lastName,
        },
        isRead:
          !message.readers && message.readers.length === 0
            ? false
            : message.readers.some((reader) => reader.user.id === userId),
      }));
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
        relations: ['owner', 'chat'],
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
      const unreadCount = await this.messageRepository
        .createQueryBuilder('message')
        .leftJoin('message.readers', 'reader', 'reader.user = :userId', {
          userId,
        })
        .where('reader.id IS NULL')
        .getCount();

      return unreadCount;
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
        .where('message.isRead = false')
        .andWhere('message.chat = :chatId', { chatId })
        .andWhere('reader.id IS NULL')
        .getCount();

      return unreadCount;
    } catch (error) {
      throw new Error('Failed to fetch unread message count by chat');
    }
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    try {
      const message = await this.messageRepository.findOne({
        where: { id: messageId },
        relations: ['readers', 'chat', 'readers.user'],
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
      }
    } catch (error) {
      throw new Error(`Failed to mark message as read: ${error.message}`);
    }
  }
}
