import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { AuthModule } from '../auth/auth.module';
import { VerificationController } from './controllers/verification.controller';
import { UserEmailService } from './services/user-email.service';
import * as Consumers from './rabbitmq/consumers';
import { UsersMessagesController } from './controllers/users-messages.controller';
@Module({
  imports: [CommonModule, AuthModule],
  controllers: [
    UsersController,
    VerificationController,
    UsersMessagesController,
  ],
  providers: [UsersService, UserEmailService, ...Object.values(Consumers)],
  exports: [],
})
export class UsersModule {}
