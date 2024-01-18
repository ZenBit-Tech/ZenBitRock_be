import { IsBoolean } from 'class-validator';

export class ChangeStatusContentDto {
  @IsBoolean()
  checked: boolean;
}
