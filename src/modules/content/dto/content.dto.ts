import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsOptional, MaxLength, MinLength } from 'class-validator';

import { ContentType } from 'src/common/types/content/content.type.enum';

export class ContentDto {
  @ApiProperty({
    example: 'Hello World!',
    description: 'Content title field',
  })
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(255)
  title: string;

  @ApiProperty({
    example: 'https://helloworld.com',
    description: 'Content link field',
  })
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(255)
  link: string;

  @ApiProperty({
    example: 'https://helloworld.com',
    description: 'Content screeshot field',
  })
  @IsOptional()
  @MinLength(1)
  @MaxLength(255)
  screenshot?: string;

  @ApiProperty({
    example: 'video',
    description: 'Content type field',
  })
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(255)
  type: ContentType;
}
