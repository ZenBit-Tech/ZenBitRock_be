import { ApiProperty } from '@nestjs/swagger';

import { IsOptional } from 'class-validator';

export class GetMessagesDto {
  @ApiProperty({
    example: '3f9694ae-3241-48ef-b16b-32dc7d23e1d9',
    description: 'Chat id',
  })
  @IsOptional()
  chatId?: string;
}
