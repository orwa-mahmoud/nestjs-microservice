import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom, timeout } from 'rxjs';
import { RabbitmqClient } from '../../rabbitmq.types';
import { CustomConfigService } from '../../../config/custom-config.service';
import { EnvKey } from '../../../config/custom-config.enum';
import { GetUsersInformationCommand } from '../../commands/user/get-users-information.command';
import { UsersTypeDto } from '../../dto/types/users.type.dto';

@Injectable()
export class GetUsersInformationProducer {
  constructor(
    @Inject(RabbitmqClient.USER)
    private readonly client: ClientProxy,
    private customConfigService: CustomConfigService,
  ) {}

  async sendGetUsersInformationRequest(
    command: GetUsersInformationCommand,
  ): Promise<UsersTypeDto[]> {
    try {
      const rabbitmqTimeout = this.customConfigService.get<number>(
        EnvKey.RABBIT_MQ_TIMEOUT,
      );
      return await lastValueFrom(
        this.client
          .send(GetUsersInformationCommand.name, command)
          .pipe(timeout(rabbitmqTimeout)),
      );
    } catch (error) {
      throw error;
    }
  }
}
