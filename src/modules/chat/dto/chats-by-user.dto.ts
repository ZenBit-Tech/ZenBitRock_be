import { ApiProperty } from '@nestjs/swagger';

import {
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class ChatsByUserDto {
  @ApiProperty({
    example: '1',
    description: 'Page number',
  })
  @IsNotEmpty()
  @IsNumber()
  page: number;

  @ApiProperty({
    example: '100',
    description: 'Limit count of chats',
  })
  @IsNotEmpty()
  @IsNumber()
  limit: number;

  @ApiProperty({
    example: 'lastMessageTimeASC',
    description: 'Type of sorting chats',
  })
  @IsNotEmpty()
  @IsString()
  sortType: string;

  @ApiProperty({
    example: 'David',
    description: 'Name of chat member',
  })
  @IsNotEmpty()
  @IsString()
  searchParam: string;
}
