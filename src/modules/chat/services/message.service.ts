import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Chat } from 'src/common/entities/chat.entity';
import { Message } from 'src/common/entities/message.entity';

import { CreateMessageDto } from '../dto/create-message.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,

    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
  ) {}

  async getMessages(chatId: string): Promise<Message[]> {
    try {
      const messages = await this.messageRepository.find({
        where: { chat: { id: chatId } },
        relations: ['owner'],
      });

      return messages;
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
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ChatMessageReader } from 'common/entities/chatMessageReader.entity';
import { CreateMessageDto } from 'modules/chat/dto/create-message.dto';
import { GetMessagesDto } from 'modules/chat/dto/get-messages.dto';
import { GetUnreadMessagesDto } from 'modules/chat/dto/get-unread-messages.dto';
import { UnreadMessageResponseDto } from 'modules/chat/dto/unread-messages-responce.dto';
import { Message } from 'src/common/entities/message.entity';
import { User } from 'src/common/entities/user.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async getMessages(chatId: string): Promise<Message[]> {
    try {
      const messages = await this.messageRepository.find({
        where: { chat: { id: chatId } },
        relations: ['owner'],
      });

      return messages;
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

      return await this.messageRepository.findOne({
        where: { id: newMessage.id },
        relations: ['owner', 'chat'],
      });
    } catch (error) {
      throw new Error('Failed to create message');
    }
  }

  async getUnreadMessages(
    getUnreadMessagesDto: GetUnreadMessagesDto,
  ): Promise<UnreadMessageResponseDto> {
    try {
      const { userId } = getUnreadMessagesDto;
      const unreadMessages = await this.messageRepository
        .createQueryBuilder('message')
        .innerJoinAndSelect(
          'message.readers',
          'reader',
          'reader.user = :userId',
          { userId },
        )
        .where('message.isRead = false')
        .getMany();

      return { unreadMessages };
    } catch (error) {
      throw new Error('Failed to fetch unread messages');
    }
  }

  async getUnreadMessagesByChatId(
    userId: string,
    chatId: string,
  ): Promise<Message[]> {
    try {
      const unreadMessages = await this.messageRepository
        .createQueryBuilder('message')
        .innerJoinAndSelect(
          'message.readers',
          'reader',
          'reader.user = :userId',
          { userId },
        )
        .where('message.isRead = false')
        .andWhere('message.chat = :chatId', { chatId })
        .getMany();

      return unreadMessages;
    } catch (error) {
      throw new Error('Failed to fetch unread messages by chat');
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const unreadMessages = await this.messageRepository
        .createQueryBuilder('message')
        .innerJoinAndSelect(
          'message.readers',
          'reader',
          'reader.user = :userId',
          { userId },
        )
        .where('message.isRead = false')
        .getMany();

      return unreadMessages.length;
    } catch (error) {
      throw new Error('Failed to fetch unread message count');
    }
  }

  async getUnreadCountByChatId(
    userId: string,
    chatId: string,
  ): Promise<number> {
    try {
      const unreadMessages = await this.messageRepository
        .createQueryBuilder('message')
        .innerJoinAndSelect(
          'message.readers',
          'reader',
          'reader.user = :userId',
          { userId },
        )
        .where('message.isRead = false')
        .andWhere('message.chat = :chatId', { chatId })
        .getMany();

      return unreadMessages.length;
    } catch (error) {
      throw new Error('Failed to fetch unread message count by chat');
    }
  }

  async markMessageAsRead(
    messageId: string,
    userId: string,
    chatId: string,
  ): Promise<void> {
    try {
      const message = await this.messageRepository.findOneOrFail({
        where: { id: messageId },
        relations: ['readers', 'chat'],
      });

      if (!message) {
        throw new Error('Message not found');
      }

      const user = await User.findOne({ where: { id: userId } });
      if (!user) {
        throw new Error('User not found');
      }

      const isAlreadyRead = message.readers.some(
        (reader) =>
          reader.user.id === userId && reader.message.chat.id === chatId,
      );

      if (!isAlreadyRead) {
        const reader = new ChatMessageReader();
        reader.message = message;
        reader.user = user;
        await ChatMessageReader.save(reader);

        message.isRead = true;
        await this.messageRepository.save(message);
      }
    } catch (error) {
      throw new Error('Failed to mark message as read');
    }
  }
}
