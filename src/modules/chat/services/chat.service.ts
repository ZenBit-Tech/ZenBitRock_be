import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Chat } from 'src/common/entities/chat.entity';
import { User } from 'src/common/entities/user.entity';

import { CreateChatDto } from '../dto/create-chat.dto';
import { UpdateChatDto } from '../dto/update-chat.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
  ) {}

  async getChats(): Promise<Chat[] | []> {
    try {
      const chats = await this.chatRepository.find({
        order: { createdAt: 'DESC' },
      });

      return chats;
    } catch (error) {
      throw error;
    }
  }

  async getChat(id: string): Promise<Chat> {
    try {
      const chat = await this.chatRepository.findOneBy({ id });

      if (!chat) {
        throw new NotFoundException('Chat not found');
      }
      return chat;
    } catch (error) {}
  }

  async createChat(
    createChatDto: CreateChatDto,
    userId: string,
  ): Promise<{ chat: Chat }> {
    try {
      const chat = this.chatRepository.create({
        title: createChatDto.title,
        owner: { id: userId },
        isPrivate: createChatDto.isPrivate,
      });
      await this.chatRepository.save(chat);
      return { chat };
    } catch (error) {
      throw error;
    }
  }

  async deleteChat(id: string, userId: string): Promise<void> {
    try {
      const deleteChat = await this.chatRepository.delete({
        id,
        owner: { id: userId },
      });
      if (!deleteChat.affected) {
        throw new NotFoundException('Chat not found');
      }
      throw new HttpException('Chat deleted successfully', HttpStatus.OK);
    } catch (error) {
      throw error;
    }
  }

  async updateChatData(id: string, chatData: UpdateChatDto): Promise<Chat> {
    try {
      const chat = await this.chatRepository.findOneOrFail({
        where: { id },
        relations: ['members'],
      });

      if (!chat) {
        throw new NotFoundException('Chat not found');
      }

      chat.members = chatData.memberIds.map((memberId) => ({
        id: memberId,
      })) as User[];
      await this.chatRepository.save(chat);

      return await this.chatRepository.findOne({ where: { id } });
    } catch (error) {
      throw error;
    }
  }
}
