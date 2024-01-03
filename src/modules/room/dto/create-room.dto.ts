import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({
    example: '12345678',
    description: 'Room title field',
  })
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  title: string;

  @ApiProperty({
    example: [
      '267437e1-25bb-4bb3-8c11-149021f669b0',
      'cb319a67-7386-4369-9535-221f6de2672d',
    ],
    description: 'Array of user IDs to be added as members',
    required: false,
  })
  @IsArray()
  @ArrayMinSize(2)
  memberIds?: string[];
}
