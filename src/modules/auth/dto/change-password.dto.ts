import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
    @ApiProperty({
        example: '12345678',
       
      })
  @IsNotEmpty()
  @IsString()
  oldPassword: string;


 @ApiProperty({
        example: '12345678'  
      })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  newPassword: string;
}