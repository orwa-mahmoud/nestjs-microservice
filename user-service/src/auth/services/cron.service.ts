import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class CronService {
  constructor(private authenticationService: AuthenticationService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    await this.authenticationService.deleteBlacklistedToken();
  }
}
