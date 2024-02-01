import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChatMessageReader, Chat, Message } from 'src/common/entities';

import { EventsModule } from '../events/events.module';

import { ChatController } from './conrollers/chat.controller';
import { MessageController } from './conrollers/message.controller';
import { ChatService } from './services/chat.service';
import { MessageService } from './services/message.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, Message, ChatMessageReader]),
    forwardRef(() => EventsModule),
  ],
  controllers: [ChatController, MessageController],
  providers: [ChatService, MessageService],
  exports: [MessageService, ChatService],
})
export class ChatModule {}
