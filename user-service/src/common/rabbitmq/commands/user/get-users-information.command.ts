import { IsArray, IsNumber } from 'class-validator';
export class GetUsersInformationCommand {
  @IsArray()
  @IsNumber({}, { each: true })
  usersIds: number[];

  constructor(usersIds: number[]) {
    this.usersIds = usersIds;
  }
}
