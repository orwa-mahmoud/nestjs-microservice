import { IsEmail, MinLength, MaxLength, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
export class LoginBodyDto {
  @IsEmail()
  @MaxLength(255, { message: 'email cannot be longer than 255 characters' })
  @Transform((param) => param.value?.toLowerCase())
  email: string;

  @MinLength(8, { message: 'password must be at least 8 characters long' })
  @MaxLength(20, { message: 'password cannot be longer than 20 characters' })
  password: string;

  @IsBoolean({ message: 'remember me is required' })
  rememberMe: boolean;
}
