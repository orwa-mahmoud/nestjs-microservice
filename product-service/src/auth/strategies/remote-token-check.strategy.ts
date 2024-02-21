// custom.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';

import { CustomConfigService } from '../../common/config/custom-config.service';
import { EnvKey } from '../../common/config/custom-config.enum';
import { rc } from '../../common/response/response-container';
import { ValidateTokenAndAuthorizationProducer } from '../../common/rabbitmq/producers';
import { ValidateTokenAndAuthorizeCommand } from '../../common/rabbitmq/commands/user/validate-token-and-authorize.command';
import { CustomLoggerService } from '../../common/logger/custom-logger.service';
import { TokenData } from '../types/auth.type';
import { UserStatuses } from '../../common/types/user.type';

@Injectable()
export class RemoteTokenCheckStrategy extends PassportStrategy(
  Strategy,
  'remote-token-check',
) {
  constructor(
    private customConfigService: CustomConfigService,
    private rabbitMQAuthProducer: ValidateTokenAndAuthorizationProducer,
    private loggerService: CustomLoggerService,
  ) {
    super();
  }

  async validate(request: any): Promise<any> {
    const tokenName = this.customConfigService.get<string>(
      EnvKey.AUTH_COOKIE_NAME,
    );
    const token = request.cookies?.[tokenName];
    if (!token) throw rc().errorUnAuthenticated();
    let res: {
      isValid: boolean;
      userData: TokenData;
    };

    try {
      const command = new ValidateTokenAndAuthorizeCommand(token, []);
      res =
        await this.rabbitMQAuthProducer.sendValidateTokenAndAuthorizeRequest(
          command,
        );
    } catch (error) {
      this.loggerService.error(
        'Error communicating with the user service to validate auth',
        error.toString(),
      );
      throw rc().errorServiceUnavailable();
    }
    if (!res.isValid) {
      throw rc().errorUnAuthenticated();
    }

    if (res.userData.status === UserStatuses.UN_VERIFIED) {
      throw rc().errorUnAuthorized('you need to verify your account');
    }

    return { user: res.userData, isRestricted: true };
  }
}
