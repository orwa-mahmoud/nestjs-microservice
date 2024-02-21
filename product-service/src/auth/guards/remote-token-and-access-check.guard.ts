import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { ACLConfig } from '../types/auth.type';
import { ACL_META_DATA_IDENTIFIER } from '../decorators/acl-meta-data.decorator';

/**
 * use this guard to check if the token is valid and the user is authorized
 * to provide the roles you should use ACL  decorator,
 * check ACLConfig in auth/decorators/acl-meta-data.decorator.ts for more details .
 */
@Injectable()
export default class RemoteTokenAndAccessCheckGuard extends AuthGuard(
  'remote-token-and-access-check',
) {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    request.aclData = this.reflector.getAllAndOverride<ACLConfig[]>(
      ACL_META_DATA_IDENTIFIER,
      [context.getHandler(), context.getClass()],
    );
    return super.canActivate(context);
  }
}
