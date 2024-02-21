import { SetMetadata } from '@nestjs/common';
import { ACLConfig } from '../types/auth.type';

export const ACL_META_DATA_IDENTIFIER = 'ACL_DATA_IDENTIFIER';

/**
 * use this decorator to set the roles and is restricted data from your controller
 * you should use LocalTokenAndAccessCheckGuard guard with it
 * check ACLConfig in auth/types/auth.type for more details .
 */
export const ACL = (configs: ACLConfig[]) =>
  SetMetadata(ACL_META_DATA_IDENTIFIER, configs);
