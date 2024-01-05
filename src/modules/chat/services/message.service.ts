import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from 'src/common/entities/message.entity';
import { CreateMessageDto } from '../dto/create-message.dto';

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
        relations: ['owner'],
      });
    } catch (error) {
      throw new Error('Failed to create message');
    }
  }
}
