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

  async getMessages(chatId: string): Promise<MessageResponse[]> {
    try {
      const messages = await this.messageRepository
        .createQueryBuilder('message')
        .leftJoinAndSelect('message.owner', 'owner')
        .leftJoinAndSelect('message.readers', 'readers')
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

        return {
          id: message.id,
          createdAt: message.createdAt,
          content: message.content,
          chat: message.chat,
          owner: {
            id: message.owner.id,
            firstName: message.owner.firstName,
            lastName: message.owner.lastName,
          },
          isReadBy,
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
      const unreadCount = await this.messageRepository
        .createQueryBuilder('message')
        .leftJoin('message.readers', 'reader', 'reader.user = :userId', {
          userId,
        })
        .leftJoin('message.owner', 'owner')
        .where('(reader.id IS NULL OR reader.isRead = false)') // Count messages where the user is not a reader or the message is not read
        .andWhere('owner.isDeleted = false') // Additional condition if needed
        .getCount();

      console.log('Unread Count:', unreadCount);
      return unreadCount;
    } catch (error) {
      console.error('Error fetching unread message count:', error);
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
        .where('message.chat.id = :chatId', { chatId })
        .andWhere('(reader.id IS NULL OR reader.isRead = false)') // Count messages in the chat where the user is not a reader or the message is not read
        .getCount();

      console.log('Unread Count By ChatId:', unreadCount);
      return unreadCount;
    } catch (error) {
      console.error('Error fetching unread message count by chat:', error);
      throw new Error('Failed to fetch unread message count by chat');
    }
  }

  async markMessageAsRead(
    messageId: string,
    userId: string,
  ): Promise<string[]> {
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

        return Array.from(new Set(userIds));
      }
    } catch (error) {
      throw new Error(`Failed to mark message as read: ${error.message}`);
    }
  }
}
