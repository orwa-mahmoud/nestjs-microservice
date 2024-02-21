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
import { ACLConfig, TokenData } from '../types/auth.type';
import { AuthData } from '../decorators/auth-data.decorator';
import {UserStatuses} from "../../common/types/user.type";

@Injectable()
export class RemoteTokenAndAccessCheckStrategy extends PassportStrategy(
  Strategy,
  'remote-token-and-access-check',
) {
  constructor(
    private customConfigService: CustomConfigService,
    private rabbitMQAuthProducer: ValidateTokenAndAuthorizationProducer,
    private loggerService: CustomLoggerService,
  ) {
    super();
  }

  async validate(request: any): Promise<AuthData> {
    const tokenName = this.customConfigService.get<string>(
      EnvKey.AUTH_COOKIE_NAME,
    );
    const token = request.cookies?.[tokenName];
    if (!token) throw rc().errorUnAuthenticated();

    let res: {
      isValid: boolean;
      isAuthorized: boolean;
      isRestricted: boolean;
      userData: TokenData;
    };

    const aclData = (request.aclData as ACLConfig[]) ?? [];
    try {
      const command = new ValidateTokenAndAuthorizeCommand(token, aclData);
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

    if (res && res.userData?.status === UserStatuses.UN_VERIFIED) {
      throw rc().errorUnAuthorized('you need to verify your account');
    }

    if (!res.isAuthorized) {
      throw rc().errorUnAuthorized();
    }
    return { user: res.userData, isRestricted: res.isRestricted };
  }
}
