import { ApiProperty } from '@nestjs/swagger';

import { IsOptional } from 'class-validator';

import { Chat } from 'src/common/entities/chat.entity';
import { User } from 'src/common/entities/user.entity';

export class GetMessagesAllDto {
  @ApiProperty({
    example: '3f9694ae-3241-48ef-b16b-32dc7d23e1d9',
    description: 'Chat id',
  })
  @IsOptional()
  chatId?: string;

  @ApiProperty({
    example: 'Hello!',
    description: 'content',
  })
  @IsOptional()
  content?: string;

  @IsOptional()
  readers?: { id: string }[];

  chat: Chat;

  owner: User;

  id: string;

  createdAt: Date;

  updatedAt: Date;
}
