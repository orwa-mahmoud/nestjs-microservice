import { Injectable } from '@nestjs/common';
import { CustomLoggerService } from '../../common/logger/custom-logger.service';

export type AuthorizationData = {
  isAuthorized: boolean;
  isRestricted: boolean;
  workspaceId: number;
  workspaceName?: string;
  workspaceSlug?: string;
};
@Injectable()
export class AuthorizationService {
  constructor(private customLoggerService: CustomLoggerService) {}
}
