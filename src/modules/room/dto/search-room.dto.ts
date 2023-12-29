import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class SearchRoomsDto {
  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  ownerId?: number;
}
