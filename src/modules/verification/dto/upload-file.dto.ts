import { IsNotEmpty, IsString } from 'class-validator';

export class UpoadFileDto {
  @IsNotEmpty()
  @IsString()
  fileName: string;

  @IsNotEmpty()
  @IsString()
  fileUrl: string;
}
