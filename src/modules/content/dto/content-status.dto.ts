import { ApiProperty } from '@nestjs/swagger';

import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ChangeStatusContentDto {
  @ApiProperty({
    example: 'true',
    description: 'Content was read',
  })
  @IsNotEmpty()
  @IsBoolean()
  checked: boolean;
}
