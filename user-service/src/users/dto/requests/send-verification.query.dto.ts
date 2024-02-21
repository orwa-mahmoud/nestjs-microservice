import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';

export class SendVerificationQueryDto {
  @IsEmail()
  @Transform((param) => param.value?.toLowerCase())
  email: string;
}
