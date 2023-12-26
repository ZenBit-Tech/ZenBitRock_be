import { IsOptional } from 'class-validator';

export class GetMessagesDto {
  @IsOptional()
  roomId?: string;
}
