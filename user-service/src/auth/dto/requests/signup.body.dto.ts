import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { MatchPassword } from '../../../common/validators/match.validator';

export class SignupBodyDto {
  @MinLength(3, { message: 'first name must be at least 3 characters long' })
  @MaxLength(255, {
    message: 'first name cannot be longer than 255 characters',
  })
  @IsString()
  firstName: string;

  @MinLength(3, { message: 'last name must be at least 3 characters long' })
  @MaxLength(255, { message: 'last name cannot be longer than 255 characters' })
  @IsString()
  lastName: string;

  @IsEmail()
  @MaxLength(255, { message: 'email cannot be longer than 255 characters' })
  @Transform((param) => param.value?.toLowerCase())
  email: string;

  @IsString()
  @MaxLength(255, { message: 'password cannot be longer than 255 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W_]{8,}$/, {
    message:
      'password must contain at least one lowercase letter, one uppercase letter, and one number',
  })
  @MatchPassword('repeatPassword')
  @MinLength(8, { message: 'password must be at least 8 characters long' })
  @MaxLength(20, { message: 'password cannot be longer than 20 characters' })
  password: string;

  @IsNotEmpty({ message: 'please confirm your password' })
  @IsString({ message: 'please enter a valid password confirmation' })
  repeatPassword: string;
}
