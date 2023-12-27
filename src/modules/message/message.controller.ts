import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';

import { CreateMessageDto } from './dto/create-message.dto';
import { GetMessagesDto } from './dto/get-messages.dto';
import { MessageService } from './message.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
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
}
