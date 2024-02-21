import { Controller, ValidationPipe } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { ValidateTokenAndAuthorizeCommand } from '../../common/rabbitmq/commands/user/validate-token-and-authorize.command';
import { ValidateTokenAndAuthorizeResponse } from '../types/auth.type';
import { ValidateTokenAndAuthorizationConsumer } from '../rabbitmq/consumers';

@Controller()
export class AuthenticationMessagesController {
  constructor(
    private validateTokenAndAuthorizeConsumer: ValidateTokenAndAuthorizationConsumer,
  ) {}

  @MessagePattern(ValidateTokenAndAuthorizeCommand.name)
  async handleValidateTokenAndAuthorize(
    @Payload(new ValidationPipe({ transform: true }))
    data: ValidateTokenAndAuthorizeCommand,
    @Ctx() context: RmqContext,
  ): Promise<ValidateTokenAndAuthorizeResponse> {
    return this.validateTokenAndAuthorizeConsumer.validateTokenAndAuthorization(
      data,
      context,
    );
  }
}
