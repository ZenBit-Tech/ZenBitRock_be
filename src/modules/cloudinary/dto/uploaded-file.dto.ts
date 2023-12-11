import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty } from 'class-validator';

export class UploadedFileDto {
  @ApiProperty({ example: '123456789', description: 'File url' })
  @IsNotEmpty()
  fileUrl: string;

  @ApiProperty({ example: '123456789', description: 'File public id' })
  @IsNotEmpty()
  filePublicId: string;
}
