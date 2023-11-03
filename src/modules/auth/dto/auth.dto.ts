import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class AuthDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3, {
    message: 'The name must contain a minimum of three characters',
  })
  @MaxLength(20, {
    message: 'The name should not be more than twenty characters',
  })
    name: string;

  @IsNotEmpty()
  @IsEmail()
  @MinLength(8, {
    message: 'The email must contain a minimum of eight characters',
  })
  @MaxLength(20, {
    message: 'The email should not be more than twenty characters',
  })
    email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6, {
    message: 'The password must contain a minimum of five characters',
  })
  @MaxLength(20, {
    message: 'The password should not be more than twenty characters',
  })
    password: string;
}
