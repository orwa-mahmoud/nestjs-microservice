import { DynamicModule, Module } from '@nestjs/common';
import { RabbitmqService } from './rabbitmq.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import {
  IRabbitmqModuleAsyncOptions,
  IRabbitmqModuleOptions,
} from './rabbitmq.types';

const RMQ_MODULE_OPTIONS = 'RMQ_MODULE_OPTIONS';
const RMQ_MODULE_ID = 'RMQ_MODULE_ID';

@Module({
  providers: [RabbitmqService],
  exports: [RabbitmqService],
  imports: [],
})
export class RabbitmqModule {
  static registerAsync(options: IRabbitmqModuleAsyncOptions): DynamicModule {
    const RmqModuleOptionsProvider = {
      provide: RMQ_MODULE_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };

    return {
      module: RabbitmqModule,
      imports: [
        ...(options.imports || []),
        ClientsModule.registerAsync([
          {
            name: options.clientName,
            useFactory: async (rmqModuleOptions: IRabbitmqModuleOptions) => {
              return {
                transport: Transport.RMQ,
                options: {
                  urls: rmqModuleOptions.urls,
                  queue: options.clientName,
                },
              };
            },
            inject: [RMQ_MODULE_OPTIONS],
            imports: options.imports || [],
            extraProviders: [RmqModuleOptionsProvider],
          },
        ]),
      ],
      providers: [
        RmqModuleOptionsProvider,
        {
          provide: RMQ_MODULE_ID,
          useValue: randomStringGenerator(),
        },
      ],
      exports: [RMQ_MODULE_OPTIONS, ClientsModule],
    };
  }
}
