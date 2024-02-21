import { Controller, ValidationPipe } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { GetUsersInformationConsumer } from '../rabbitmq/consumers';

import { GetUsersInformationCommand } from '../../common/rabbitmq/commands/user/get-users-information.command';
import { UsersTypeDto } from '../../common/rabbitmq/dto/types/users.type.dto';

@Controller()
export class UsersMessagesController {
  constructor(
    private getUsersInformationConsumer: GetUsersInformationConsumer,
  ) {}

  @MessagePattern(GetUsersInformationCommand.name)
  async handleGetUsersInformation(
    @Payload(new ValidationPipe({ transform: true }))
    data: GetUsersInformationCommand,
    @Ctx() context: RmqContext,
  ): Promise<UsersTypeDto[]> {
    return this.getUsersInformationConsumer.getUsersInformation(data, context);
  }
}
