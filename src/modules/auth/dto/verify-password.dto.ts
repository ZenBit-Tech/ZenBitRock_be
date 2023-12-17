import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class VerifyPasswordDto {
  @ApiProperty({
    example: '12345678',
  })
  @IsNotEmpty()
  @IsString()
  oldPassword: string;
}
