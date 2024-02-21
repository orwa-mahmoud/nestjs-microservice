import { UsersTypeDto } from '../../dto/types/users.type.dto';

export class BaseEmailCommand {
  public toUsers: UsersTypeDto[];
  public fromUser?: UsersTypeDto;
}
