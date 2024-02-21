import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom, timeout } from 'rxjs';
import { RabbitmqClient } from '../../rabbitmq.types';
import { EnvKey } from '../../../config/custom-config.enum';
import { CustomConfigService } from '../../../config/custom-config.service';
import SendVerificationEmailCommand from '../../commands/notification/send-verification-email.command';
import { CustomLoggerService } from '../../../logger/custom-logger.service';

@Injectable()
export class SendVerificationEmailProducer {
  constructor(
    @Inject(RabbitmqClient.NOTIFICATION)
    private readonly client: ClientProxy,
    private customConfigService: CustomConfigService,
    private customLoggerService: CustomLoggerService,
  ) {}

  async sendVerificationEmailRequest(
    command: SendVerificationEmailCommand,
  ): Promise<boolean> {
    try {
      const rabbitmqTimeout = this.customConfigService.get<number>(
        EnvKey.RABBIT_MQ_TIMEOUT,
      );
      // usually we should have service responsible to send notifications and emails to the user
      // for now I will log it, so you can click on the link from the console
      this.customLoggerService.log(command.verificationLink);
      // when we have notification service we will delete this return true
      return true;
      /*
      return await lastValueFrom(
        this.client
          .send(SendVerificationEmailCommand.name, command)
          .pipe(timeout(rabbitmqTimeout)),
      );
      */
    } catch (error) {
      this.customLoggerService.error(
        'sendVerificationEmailRequest fail: ',
        error,
      );
      return false;
    }
  }
}
