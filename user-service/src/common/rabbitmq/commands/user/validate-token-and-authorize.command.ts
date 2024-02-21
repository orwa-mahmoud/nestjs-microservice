import { IsNotEmpty, IsString, IsArray } from 'class-validator';
import { ACLConfig } from '../../../../auth/types/auth.type';
export class ValidateTokenAndAuthorizeCommand {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsArray()
  aclData: ACLConfig[] = [];

  constructor(token: string, aclData: ACLConfig[]) {
    this.token = token;
    this.aclData = aclData;
  }
}
