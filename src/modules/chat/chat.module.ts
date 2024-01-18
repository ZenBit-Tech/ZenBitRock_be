import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Chat } from 'src/common/entities/chat.entity';
import { Message } from 'src/common/entities/message.entity';

import { ChatController } from './conrollers/chat.controller';
import { MessageController } from './conrollers/message.controller';
import { ChatService } from './services/chat.service';
import { MessageService } from './services/message.service';

@Module({
  imports: [TypeOrmModule.forFeature([Chat, Message])],
  controllers: [ChatController, MessageController],
  providers: [ChatService, MessageService],
  exports: [MessageService],
})
export class ChatModule {}
