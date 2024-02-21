import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvKey } from './custom-config.enum';

@Injectable()
export class CustomConfigService {
  constructor(private readonly configService: ConfigService) {}

  public get<ValueType>(key: EnvKey) {
    return this.configService.get<ValueType>(key);
  }

  public getExpirationDate(rememberMe: boolean): Date {
    let expiration: string;
    let expireInSeconds: number;
    if (rememberMe) {
      expiration = this.get<string>(EnvKey.JWT_TOKEN_LIFETIME_REMEMBER_ME);
      expireInSeconds = Number(expiration) * 24 * 60 * 60;
    } else {
      expiration = this.get<string>(EnvKey.JWT_TOKEN_LIFETIME_NORMAL);
      expireInSeconds = Number(expiration) * 60 * 60;
    }
    return new Date(Date.now() + expireInSeconds * 1000);
  }

  public getExpirationPeriod(rememberMe: boolean): string {
    let duration: string;
    if (rememberMe) {
      duration = this.get<string>(EnvKey.JWT_TOKEN_LIFETIME_REMEMBER_ME) + 'd';
    } else {
      duration = this.get<string>(EnvKey.JWT_TOKEN_LIFETIME_NORMAL) + 'h';
    }
    return duration;
  }

  public isEnvProduction(): boolean {
    return this.get<string>(EnvKey.NODE_ENV).toUpperCase() === 'PRODUCTION';
  }
}
