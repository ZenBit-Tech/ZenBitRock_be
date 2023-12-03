import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'Agent', description: 'User role' })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  role?: string;

  @ApiProperty({ example: 'New York', description: 'User city' })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'United States', description: 'User country' })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  country?: string;

  @ApiProperty({ example: '1-212-1234567', description: 'User phone number' })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  phone?: string;

  @ApiProperty({ example: '123456789', description: 'User id' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ example: '123456789', description: 'Contact id in Qobrix' })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  qobrixContactId?: string;

  @ApiProperty({ example: 'Blagovist', description: 'Agency name' })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  agencyName?: string;

  @ApiProperty({ example: 'About me', description: 'User description' })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  description?: string;
}
