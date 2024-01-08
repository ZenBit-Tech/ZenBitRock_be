import { ApiProperty } from '@nestjs/swagger';

import { Message } from 'common/entities/message.entity';

export class UnreadMessageResponseDto {
  @ApiProperty({ type: [Message] })
  unreadMessages: Message[];
}
