import { ApiProperty } from '@nestjs/swagger';

import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ConfirmEmailDto {
  @ApiProperty({
    example: 'johndoe@gmail.com',
    description: 'User email field',
  })
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    example: '003032',
    description: 'Email confirmation code',
  })
  @IsString()
  @IsNotEmpty()
  readonly code: string;
}
