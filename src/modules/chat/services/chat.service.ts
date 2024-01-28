import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { Chat, User } from 'src/common/entities';
import { ChatEvent } from 'src/common/enums';
import { EventsGateway } from 'src/modules/events/events.gateway';
import { CreateChatDto } from '../dto/create-chat.dto';
import { UpdateChatDto } from '../dto/update-chat.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @Inject(forwardRef(() => EventsGateway))
    private eventsGateway: EventsGateway,
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

      if (createChatDto.memberIds && createChatDto.memberIds.length > 0) {
        chat.members = createChatDto.memberIds.map((memberId) => ({
          id: memberId,
        })) as User[];
      }
      await this.chatRepository.save(chat);

      for (const member of chat.members) {
        await this.eventsGateway.addToRoom(member.id, chat.id);
      }

      this.eventsGateway.server.to(chat.id).emit(ChatEvent.NewChat, chat.id);

      return { chat };
    } catch (error) {
      throw error;
    }
  }

  async checkForPrivateChat(
    currentUserId: string,
    targetAgentId: string,
  ): Promise<string | null> {
    const chat = await this.chatRepository
      .createQueryBuilder('chat')
      .innerJoin('chat.members', 'member')
      .where('chat.isPrivate = :isPrivate', { isPrivate: true })
      .andWhere('member.id IN (:...memberIds)', {
        memberIds: [currentUserId, targetAgentId],
      })
      .groupBy('chat.id')
      .having('COUNT(chat.id) = :count', { count: 2 })
      .getOne();

    return chat ? chat.id : null;
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

      this.eventsGateway.server.to(id).emit(ChatEvent.ChatDeleted, id);

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

      const currentMembers = chat.members;

      if (chatData.memberIds && chatData.memberIds.length > 0) {
        chat.members = chatData.memberIds.map((memberId) => ({
          id: memberId,
        })) as User[];
      } else if (chatData.memberIds && chatData.memberIds.length === 0) {
        chat.members = [];
      }

      if (chatData.title) {
        chat.title = chatData.title;
      }

      const updatedChat = await this.chatRepository.save(chat);
      const { id: chatId } = updatedChat;

      if (chatData.memberIds) {
        await this.eventsGateway.handleChatUpdate(
          chatData.memberIds,
          currentMembers,
          updatedChat,
        );
      }

      this.eventsGateway.server.to(chatId).emit(ChatEvent.ChatUpdated, chatId);

      return await this.chatRepository.findOne({ where: { id } });
    } catch (error) {
      throw error;
    }
  }

  async checkUserisChatMember(
    chatId: string,
    userId: string,
  ): Promise<boolean> {
    const chat = await this.chatRepository.findOne({
      where: { id: chatId, members: { id: userId } },
    });

    return Boolean(chat);
  }
}
