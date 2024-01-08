import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from 'src/common/entities/chat.entity';
import { Repository } from 'typeorm';
import { CreateChatDto } from '../dto/create-chat.dto';

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
        throw new NotFoundException(` not found`);
      }
      return chat;
    } catch (error) {}
  }

  async createChat(
    createChatDto: CreateChatDto,
    userId: string,
    memberIds: string[],
  ): Promise<{ chat: Chat }> {
    try {
      const chat = this.chatRepository.create({
        title: createChatDto.title,
        owner: { id: userId },
        members: memberIds.map((memberId) => ({ id: memberId })),
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
}
