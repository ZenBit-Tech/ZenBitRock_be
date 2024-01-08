import { ApiProperty } from '@nestjs/swagger';

import { IsOptional } from 'class-validator';

export class GetUnreadMessagesDto {
  @ApiProperty({
    example: '267437e1-25bb-4bb3-8c11-149021f669b0',
    description: 'User ID',
  })
  @IsOptional()
  userId?: string;
}
