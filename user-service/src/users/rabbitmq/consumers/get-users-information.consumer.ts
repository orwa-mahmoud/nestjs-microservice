import { Injectable } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { RabbitmqService } from '../../../common/rabbitmq/rabbitmq.service';
import { CustomLoggerService } from '../../../common/logger/custom-logger.service';
import { GetUsersInformationCommand } from '../../../common/rabbitmq/commands/user/get-users-information.command';
import { UsersTypeDto } from '../../../common/rabbitmq/dto/types/users.type.dto';
import { UsersService } from '../../services/users.service';

@Injectable()
export class GetUsersInformationConsumer {
  constructor(
    private rabbitmqService: RabbitmqService,
    private usersService: UsersService,
    private customLoggerService: CustomLoggerService,
  ) {}
  async getUsersInformation(
    getFilesInformationCommand: GetUsersInformationCommand,
    context: RmqContext,
    acknowledgeMessage = true,
  ): Promise<UsersTypeDto[]> {
    try {
      const users = await this.usersService.getUsersInformation(
        getFilesInformationCommand,
      );
      if (acknowledgeMessage) {
        this.rabbitmqService.ack(context);
      }
      return users;
    } catch (error) {
      this.customLoggerService.error('getFilesInformation fail: ', error);
      throw error;
    }
  }
}
