import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty } from 'class-validator';

export class DeleteAvatarDto {
  @ApiProperty({ example: '123456789', description: 'User id' })
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: '123456789', description: 'Avatar public id' })
  @IsNotEmpty()
  avatarPublicId: string;
}
