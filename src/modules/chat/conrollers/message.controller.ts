import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { JwtAuthGuard } from 'modules/auth/guards/jwt-auth.guard';
import { CreateMessageDto } from 'modules/chat/dto/create-message.dto';
import { GetMessagesDto } from 'modules/chat/dto/get-messages.dto';
import { GetUnreadMessagesDto } from 'modules/chat/dto/get-unread-messages.dto';
import { UnreadMessageResponseDto } from 'modules/chat/dto/unread-messages-responce.dto';
import { MessageService } from 'modules/chat/services/message.service';
import { Message } from 'src/common/entities/message.entity';

@Controller('messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get()
  @ApiOperation({
    summary: 'Get messages',
    description: 'Get a list of messages',
  })
  @ApiResponse({ status: 200, description: 'Return a list of messages' })
  async getMessages(
    @Query() getMessagesDto: GetMessagesDto,
  ): Promise<Message[]> {
    try {
      return await this.messageService.getMessages(getMessagesDto);
    } catch (error) {
      throw new Error('Failed to get messages');
    }
  }

  @Post()
  @ApiOperation({
    summary: 'Create a message',
    description: 'Create a new message',
  })
  @ApiResponse({
    status: 201,
    description: 'The message has been successfully created',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createMessages(
    @Request() req,
    @Body() createMessageDto: CreateMessageDto,
  ): Promise<Message> {
    try {
      return await this.messageService.createMessage(
        createMessageDto,
        req.user.id,
      );
    } catch (error) {
      throw new Error('Failed to create message');
    }
  }

  @Get('unread')
  @ApiOperation({
    summary: 'Get unread messages for a user',
    description: 'Get a list of unread messages for a user',
  })
  @ApiResponse({
    status: 200,
    description: 'Return a list of unread messages',
    type: UnreadMessageResponseDto,
  })
  async getUnreadMessages(
    @Query() getUnreadMessagesDto: GetUnreadMessagesDto,
  ): Promise<UnreadMessageResponseDto> {
    try {
      return await this.messageService.getUnreadMessages(getUnreadMessagesDto);
    } catch (error) {
      throw new Error('Failed to get unread messages');
    }
  }
}
