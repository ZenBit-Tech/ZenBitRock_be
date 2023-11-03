import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(5, {
    message: 'The firstName must contain a minimum of five characters',
  })
  @MaxLength(20, {
    message: 'The firstName should not be more than twenty characters',
  })
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(5, {
    message: 'The lastName must contain a minimum of five characters',
  })
  @MaxLength(20, {
    message: 'The lastName should not be more than twenty characters',
  })
  lastName: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(14, {
    message: 'The value of this field cannot be less than 14',
  })
  @Max(65, {
    message: 'The value of this field cannot be more than 65',
  })
  age: number;

  @IsNotEmpty()
  @IsString()
  @MinLength(8, {
    message: 'The email must contain a minimum of eight characters',
  })
  @MaxLength(20, {
    message: 'The email should not be more than twenty characters',
  })
  email: string;
}
