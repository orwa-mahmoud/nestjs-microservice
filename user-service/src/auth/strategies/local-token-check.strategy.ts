// custom.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { rc } from '../../common/response/response-container';
import { CustomLoggerService } from '../../common/logger/custom-logger.service';
import { CustomConfigService } from '../../common/config/custom-config.service';
import { EnvKey } from '../../common/config/custom-config.enum';
import { AuthenticationService } from '../services/authentication.service';
import { UserStatuses } from '../../users/enums/user.enum';

@Injectable()
export class LocalTokenCheckStrategy extends PassportStrategy(
  Strategy,
  'local-token-check',
) {
  constructor(
    private customConfigService: CustomConfigService,
    private loggerService: CustomLoggerService,
    private readonly authenticationService: AuthenticationService,
  ) {
    super();
  }

  async validate(request: any): Promise<any> {
    const tokenName = this.customConfigService.get<string>(
      EnvKey.AUTH_COOKIE_NAME,
    );
    const token = request.cookies?.[tokenName];
    if (!token) throw rc().errorUnAuthenticated();
    const res = await this.authenticationService.validateTokenAndAuthorization(
      token,
      [],
    );

    if (!res.isValid) {
      throw rc().errorUnAuthenticated();
    }

    if (res.userData.status === UserStatuses.UN_VERIFIED) {
      throw rc().errorUnAuthorized('you need to verify your account');
    }

    return { user: res.userData, isRestricted: true };
  }
}
