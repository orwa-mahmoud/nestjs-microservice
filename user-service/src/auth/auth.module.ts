import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { LocalTokenAndAccessCheckStrategy } from './strategies/local-token-and-access-check.strategy';
import { CommonModule } from '../common/common.module';
import { AuthorizationService } from './services/authorization.service';
import { AuthenticationService } from './services/authentication.service';
import { AuthenticationController } from './controllers/authentication.controller';
import { UsersService } from '../users/services/users.service';
import { LocalTokenCheckStrategy } from './strategies/local-token-check.strategy';
import { UserEmailService } from '../users/services/user-email.service';
import * as Consumers from './rabbitmq/consumers';
import {AuthenticationMessagesController} from "./controllers/authentication-messages.controller";

@Module({
  imports: [CommonModule, PassportModule],
  controllers: [AuthenticationController , AuthenticationMessagesController],
  providers: [
    LocalTokenAndAccessCheckStrategy,
    LocalTokenCheckStrategy,
    UsersService,
    UserEmailService,
    AuthenticationService,
    AuthorizationService,
    ...Object.values(Consumers),
  ],
  exports: [PassportModule, AuthenticationService, AuthorizationService],
})
export class AuthModule {}
