import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'Agent', description: 'User role' })
  @IsNotEmpty()
  @IsString()
  role?: string;

  @ApiProperty({ example: 'New York', description: 'User city' })
  @IsNotEmpty()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'US', description: 'User country' })
  @IsNotEmpty()
  @IsString()
  country?: string;

  @ApiProperty({ example: '1-212-1234567', description: 'User phone number' })
  @IsNotEmpty()
  @IsString()
  phone?: string;

  @ApiProperty({ example: '123456789', description: 'User id' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ example: 'About me', description: 'User description' })
  @IsNotEmpty()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'Blagovist', description: 'Agency name' })
  @IsNotEmpty()
  @IsString()
  agencyName?: string;
}
