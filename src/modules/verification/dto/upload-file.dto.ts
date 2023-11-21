import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

export class UpoadFileDto {
  @ApiProperty({ example: 'photo1', description: 'upload file name' })
  @IsNotEmpty()
  @IsString()
  fileName: string;

  @ApiProperty({ example: 'https://zenbitrock1.s3.us-east-1.amazonaws.com', description: 'upload file link' })
  @IsNotEmpty()
  @IsString()
  fileUrl: string;
}
