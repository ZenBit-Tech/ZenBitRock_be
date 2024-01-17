import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from 'src/common/entities/chat.entity';
import { ChatController } from '../chat/conrollers/chat.controller';
import { ChatService } from '../chat/services/chat.service';
import { Message } from 'src/common/entities/message.entity';
import { MessageService } from './services/message.service';
import { MessageController } from './conrollers/message.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Chat, Message])],
  controllers: [ChatController, MessageController],
  providers: [ChatService, MessageService],
  exports: [MessageService, ChatService],
})
export class ChatModule {}
