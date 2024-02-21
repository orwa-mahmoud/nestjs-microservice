import { Injectable } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { AuthenticationService } from '../../services/authentication.service';
import { ValidateTokenAndAuthorizeResponse } from '../../types/auth.type';
import { RabbitmqService } from '../../../common/rabbitmq/rabbitmq.service';
import { ValidateTokenAndAuthorizeCommand } from '../../../common/rabbitmq/commands/user/validate-token-and-authorize.command';

@Injectable()
export class ValidateTokenAndAuthorizationConsumer {
  constructor(
    private rabbitmqService: RabbitmqService,
    private readonly authenticationService: AuthenticationService,
  ) {}
  async validateTokenAndAuthorization(
    command: ValidateTokenAndAuthorizeCommand,
    context: RmqContext,
    acknowledgeMessage = true,
  ): Promise<ValidateTokenAndAuthorizeResponse> {
    const result =
      await this.authenticationService.validateTokenAndAuthorization(
        command.token,
        command.aclData,
      );
    if (acknowledgeMessage) {
      this.rabbitmqService.ack(context);
    }
    return result;
  }
}
