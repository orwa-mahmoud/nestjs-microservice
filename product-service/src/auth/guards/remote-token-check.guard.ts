import { AuthGuard } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

/**
 * use this guard to check if the token is valid
 */
@Injectable()
export default class RemoteTokenCheckGuard extends AuthGuard(
  'remote-token-check',
) {}
