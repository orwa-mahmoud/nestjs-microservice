import { Injectable } from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';

import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomConfigService } from '../../common/config/custom-config.service';
import { EnvKey } from '../../common/config/custom-config.enum';
import SendVerificationEmailCommand from '../../common/rabbitmq/commands/notification/send-verification-email.command';
import { SendVerificationEmailProducer } from '../../common/rabbitmq/producers';

@Injectable()
export class UserEmailService {
  constructor(
    private customConfigService: CustomConfigService,
    private readonly sendVerificationEmailProducer: SendVerificationEmailProducer,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async sendVerificationEmail(
    user: UserEntity,
    verificationToken: string,
  ): Promise<boolean> {
    const verificationLink = `${this.customConfigService.get<string>(
      EnvKey.LANDING_URL,
    )}/verification/verify?token=${verificationToken}&email=${encodeURIComponent(
      user.email,
    )}`;
    const emailCommand = new SendVerificationEmailCommand();
    emailCommand.toUsers = [user];
    emailCommand.verificationLink = verificationLink;
    return await this.sendVerificationEmailProducer.sendVerificationEmailRequest(
      emailCommand,
    );
  }
}
