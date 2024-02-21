import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvKey } from './custom-config.enum';

@Injectable()
export class CustomConfigService {
  constructor(private readonly configService: ConfigService) {}

  public get<ValueType>(key: EnvKey) {
    return this.configService.get<ValueType>(key);
  }

  public isEnvProduction(): boolean {
    return this.get<string>(EnvKey.NODE_ENV).toUpperCase() === 'PRODUCTION';
  }
}
