import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateRoomDto {
   
    @ApiProperty({
        example: '12345678',
        description: 'Room title field',
      })
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  title: string;

 


  
}