import { ModuleMetadata } from '@nestjs/common/interfaces';

export enum RabbitmqClient {
  USER = 'USER',
  PRODUCT = 'PRODUCT',
  NOTIFICATION = 'NOTIFICATION',
}

export type IRabbitmqModuleOptions = {
  urls: string[];
};

export type IRabbitmqModuleAsyncOptions = Pick<ModuleMetadata, 'imports'> & {
  clientName: RabbitmqClient;
  useFactory?: (
    ...args: any[]
  ) => Promise<IRabbitmqModuleOptions> | IRabbitmqModuleOptions;
  inject?: any[];
};
