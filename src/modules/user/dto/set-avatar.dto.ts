import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsOptional } from 'class-validator';

export class SetAvatarDto {
  @ApiProperty({ example: '123456789', description: 'User id' })
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: '123456789', description: 'Old avatar public id' })
  @IsOptional()
  @IsNotEmpty()
  avatarPublicId?: string;
}
