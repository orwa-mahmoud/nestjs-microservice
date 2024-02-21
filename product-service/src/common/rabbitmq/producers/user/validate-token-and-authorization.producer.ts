import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom, timeout } from 'rxjs';
import { RabbitmqClient } from '../../rabbitmq.types';
import { ValidateTokenAndAuthorizeCommand } from '../../commands/user/validate-token-and-authorize.command';
import { CustomConfigService } from '../../../config/custom-config.service';
import { EnvKey } from '../../../config/custom-config.enum';
import { ValidateTokenAndAuthorizeResponse } from '../../../../auth/types/auth.type';

@Injectable()
export class ValidateTokenAndAuthorizationProducer {
  constructor(
    @Inject(RabbitmqClient.USER)
    private readonly client: ClientProxy,
    private customConfigService: CustomConfigService,
  ) {}

  async sendValidateTokenAndAuthorizeRequest(
    command: ValidateTokenAndAuthorizeCommand,
  ): Promise<ValidateTokenAndAuthorizeResponse> {
    try {
      const rabbitmqTimeout = this.customConfigService.get<number>(
        EnvKey.RABBIT_MQ_TIMEOUT,
      );
      return await lastValueFrom(
        this.client
          .send(ValidateTokenAndAuthorizeCommand.name, command)
          .pipe(timeout(rabbitmqTimeout)),
      );
    } catch (error) {
      throw error;
    }
  }
}
