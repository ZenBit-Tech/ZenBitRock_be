import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateUserNotificationsDto {
  @ApiProperty({ example: '123456789', description: 'User id' })
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    example: 'false',
    description: 'Boolean: does user receive notifications or not',
    required: true,
  })
  @IsBoolean()
  receiveNotifications: boolean;
}
