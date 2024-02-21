import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { RemoteTokenAndAccessCheckStrategy } from './strategies/remote-token-and-access-check.strategy';
import { CommonModule } from '../common/common.module';
import { RemoteTokenCheckStrategy } from './strategies/remote-token-check.strategy';

@Module({
  imports: [CommonModule, PassportModule],
  providers: [
    RemoteTokenAndAccessCheckStrategy,
    RemoteTokenCheckStrategy,
  ],
  exports: [PassportModule],
})
export class AuthModule {}
