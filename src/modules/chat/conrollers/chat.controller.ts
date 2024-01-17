import {
  Body,
  Controller,
  Post,
  Patch,
  UseGuards,
  Request,
  Get,
  Delete,
  Param,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

import { JwtAuthGuard } from 'modules/auth/guards/jwt-auth.guard';
import { CreateChatDto } from 'modules/chat/dto/create-chat.dto';
import { ChatService } from 'modules/chat/services/chat.service';
import { Chat } from 'src/common/entities/chat.entity';
import { UpdateChatDto } from '../dto/update-chat.dto';

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

  @Get('/check-private-chat/:agentId')
  @ApiOperation({ summary: 'Check for an existing private chat with an agent' })
  @ApiResponse({
    status: 200,
    description: 'Existing chat id returned or null',
  })
  @ApiResponse({ status: 404, description: 'Not found' })
  async checkPrivateChat(
    @Param('agentId') agentId: string,
    @Request() req,
  ): Promise<{ chatId: string | null }> {
    try {
      const chatId = await this.chatService.checkForPrivateChat(
        req.user.id,
        agentId,
      );
      return { chatId };
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
    return this.chatService.createChat(createChatDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a chat' })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 404, description: 'Not found' })
  deleteChat(@Param('id') id: string, @Request() req): Promise<void> {
    return this.chatService.deleteChat(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Updating chat data' })
  @ApiResponse({ status: 202, description: 'Updated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async updateChat(
    @Param('id') id: string,
    @Body() chatData: UpdateChatDto,
  ): Promise<Chat> {
    try {
      return await this.chatService.updateChatData(id, chatData);
    } catch (error) {
      throw error;
    }
  }
}
