// custom.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { rc } from '../../common/response/response-container';
import { CustomLoggerService } from '../../common/logger/custom-logger.service';
import { ACLConfig } from '../types/auth.type';
import { CustomConfigService } from '../../common/config/custom-config.service';
import { EnvKey } from '../../common/config/custom-config.enum';
import { AuthenticationService } from '../services/authentication.service';
import { AuthData } from '../decorators/auth-data.decorator';
import { UserStatuses } from '../../users/enums/user.enum';

@Injectable()
export class LocalTokenAndAccessCheckStrategy extends PassportStrategy(
  Strategy,
  'local-token-and-access-check',
) {
  constructor(
    private customConfigService: CustomConfigService,
    private loggerService: CustomLoggerService,
    private readonly authenticationService: AuthenticationService,
  ) {
    super();
  }

  async validate(request: any): Promise<AuthData> {
    const tokenName = this.customConfigService.get<string>(
      EnvKey.AUTH_COOKIE_NAME,
    );
    const token = request.cookies?.[tokenName];
    if (!token) throw rc().errorUnAuthenticated();

    const aclData = request.aclData as ACLConfig[];
    const res = await this.authenticationService.validateTokenAndAuthorization(
      token,
      aclData,
    );

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
