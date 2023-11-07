import { IsNumberString, IsString, IsNotEmpty } from 'class-validator';

export class ConfigDto {
  @IsNotEmpty()
  @IsNumberString()
  APP_PORT: number;

  @IsNotEmpty()
  @IsNumberString()
  DATABASE_PORT: number;

  @IsNotEmpty()
  @IsString()
  DATABASE_HOST: string;

  @IsNotEmpty()
  @IsString()
  DATABASE_USER: string;

  @IsNotEmpty()
  @IsString()
  DATABASE_NAME: string;

  @IsString()
  DATABASE_PASSWORD: string;
}
