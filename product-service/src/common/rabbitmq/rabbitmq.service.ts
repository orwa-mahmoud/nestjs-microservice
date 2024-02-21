import { Injectable } from '@nestjs/common';
import { RmqContext, RmqOptions, Transport } from '@nestjs/microservices';
import { RabbitmqClient } from './rabbitmq.types';

@Injectable()
export class RabbitmqService {
  getOptions(
    options: RmqOptions['options'] & { queue: RabbitmqClient },
  ): RmqOptions {
    return {
      transport: Transport.RMQ,
      options: {
        noAck: false,
        persistent: true,
        ...options,
      },
    };
  }

  ack(context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessages = context.getMessage();
    channel.ack(originalMessages);
  }
}
