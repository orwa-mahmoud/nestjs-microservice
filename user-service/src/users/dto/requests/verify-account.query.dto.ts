import { Transform } from 'class-transformer';
import { IsEmail, IsString } from 'class-validator';

export class VerifyAccountQueryDto {
  @IsEmail()
  @Transform((param) => param.value?.toLowerCase())
  email: string;

  @IsString()
  token: string;
}
