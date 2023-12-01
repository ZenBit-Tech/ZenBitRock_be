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

  @IsNotEmpty()
  @IsString()
  JWT_SECRET: string;

  @IsNotEmpty()
  @IsString()
  AWS_ACCESS_KEY: string;

  @IsNotEmpty()
  @IsString()
  AWS_SECRET_ACCESS_KEY: string;

  @IsNotEmpty()
  @IsString()
  AWS_S3_REGION: string;

  @IsString()
  MAIL_USER: string;

  @IsString()
  MAIL_PASS: string;

  @IsString()
  QOBRIX_BASE_URL: string;
}
