import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

export class CreateVerificationDto {
  @ApiProperty({ example: 'John', description: 'User first name' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Smith', description: 'User last name' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'Agent', description: 'User role' })
  @IsNotEmpty()
  @IsString()
  role: string;

  @ApiProperty({ example: 'Male', description: 'User gender' })
  @IsNotEmpty()
  @IsString()
  gender: string;

  @ApiProperty({ example: '01/01/1990', description: 'User date of birth' })
  @IsNotEmpty()
  @IsString()
  dateOfBirth: string;

  @ApiProperty({ example: 'American', description: 'User nationality' })
  @IsNotEmpty()
  @IsString()
  nationality: string;

  @ApiProperty({ example: 'Passport', description: 'User document type' })
  @IsNotEmpty()
  @IsString()
  identity: string;

  @ApiProperty({ example: 'Resident Individual', description: 'User status' })
  @IsNotEmpty()
  @IsString()
  status: string;

  @ApiProperty({ example: 'Wall street', description: 'User street' })
  @IsNotEmpty()
  @IsString()
  street: string;

  @ApiProperty({ example: 'New York', description: 'User city' })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({ example: 'New York', description: 'User state' })
  @IsString()
  state: string;

  @ApiProperty({ example: '10001', description: 'User zip code' })
  @IsNotEmpty()
  @IsString()
  zip: string;

  @ApiProperty({ example: 'United States', description: 'User country' })
  @IsNotEmpty()
  @IsString()
  country: string;

  @ApiProperty({ example: '1-212-1234567', description: 'User phone number' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ example: '123456789', description: 'User id' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ example: '123456789', description: 'Cobrix contact id' })
  @IsNotEmpty()
  @IsString()
  cobrixContactId: string;

  @ApiProperty({ example: 'Blagovist', description: 'User agency name' })
  @IsNotEmpty()
  @IsString()
  agencyName: string;

  @ApiProperty({
    example: 'Someting about me',
    description: 'User information',
  })
  @IsNotEmpty()
  @IsString()
  description: string;
}
