import { IsNotEmpty, IsString } from 'class-validator';
import { BaseEmailCommand } from './base-email.command';

export default class SendVerificationEmailCommand extends BaseEmailCommand {
  @IsNotEmpty()
  @IsString()
  verificationLink: string;
}
