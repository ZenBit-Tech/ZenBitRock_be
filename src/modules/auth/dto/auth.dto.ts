import { ApiProperty } from '@nestjs/swagger';

import { IsEmail, IsNotEmpty } from 'class-validator';

export class AuthDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    example: 'johndoe@gmail.com',
    description: 'User email field',
  })
  email: string;

  @IsNotEmpty()
  @ApiProperty({
    example: '12345678',
    description: 'User email field',
  })
  password: string;
}
