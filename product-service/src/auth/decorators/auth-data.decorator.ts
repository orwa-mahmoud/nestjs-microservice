import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TokenData } from '../types/auth.type';

export type AuthData = {
  user: TokenData;
  isRestricted: boolean;
};
export const getAuthDataByContext = (ctx: ExecutionContext): AuthData => {
  if (ctx.getType() === 'http') {
    const request = ctx.switchToHttp().getRequest();
    const { user, isRestricted } = request.user;
    return { user, isRestricted };
  }
  if (ctx.getType() === 'rpc') {
    const data = ctx.switchToRpc().getData();
    const { user, isRestricted } = data.user;
    return { user, isRestricted };
  }
};
export const AuthDataDecorator = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => getAuthDataByContext(ctx),
);
