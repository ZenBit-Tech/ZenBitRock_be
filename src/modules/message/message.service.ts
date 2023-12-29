import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from 'src/common/entities/message.entity';
import { GetMessagesDto } from './dto/get-messages.dto';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async getMessages(getMessagesDto: GetMessagesDto): Promise<Message[]> {
    try {
      const messages = await this.messageRepository.findBy({
        room: { id: getMessagesDto.roomId },
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
        room: { id: createMessageDto.roomId },
        owner: { id: userId },
      });

      await this.messageRepository.save(message);

      return message;
    } catch (error) {
      throw new Error('Failed to create message');
    }
  }
}
