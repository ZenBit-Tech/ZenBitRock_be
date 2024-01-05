import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Delete,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ChatService } from '../services/chat.service';

import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateChatDto } from '../dto/create-chat.dto';
import { Chat } from 'src/common/entities/chat.entity';

@Controller('chats')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('/')
  @ApiOperation({ summary: 'Getting all chats' })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 404, description: 'Not found' })
  getChats(): Promise<Chat[]> {
    return this.chatService.getChats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Getting chat by id' })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async getChat(@Param('id') id: string): Promise<Chat> {
    try {
      return await this.chatService.getChat(id);
    } catch (error) {
      throw error;
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a chat', description: 'Create a new chat' })
  @ApiBody({
    type: CreateChatDto,
    description: 'Chat data to create a new chat',
  })
  @ApiResponse({
    status: 201,
    description: 'The chat has been successfully created',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  createChat(
    @Body() createChatDto: CreateChatDto,
    @Request() req,
  ): Promise<{ chat: Chat }> {
    const memberIds: string[] = createChatDto.memberIds || [];
    return this.chatService.createChat(createChatDto, req.user.id, memberIds);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a chat' })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 404, description: 'Not found' })
  deleteChat(@Param('id') id: string, @Request() req): Promise<void> {
    return this.
    chatService.deleteChat(id, req.user.id);
  }
}
