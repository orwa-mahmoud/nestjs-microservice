import { Injectable } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class CustomLoggerService {
  private readonly logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'warn.log', level: 'warn' }),
        new winston.transports.File({
          filename: 'combined.log',
          level: 'info',
        }),
      ],
    });
  }

  log(message: string) {
    const date = new Date();
    const dateString = date.toString();
    console.error(`${dateString} - info : ${message}`);
    this.logger.info(message);
  }

  error(message: string, trace: any) {
    const date = new Date();
    const dateString = date.toString();
    console.error(`${dateString} -error : ${message} - ${trace}`);
    this.logger.error(`${message} - ${trace}`);
  }

  warn(message: string, trace: any) {
    const date = new Date();
    const dateString = date.toString();
    console.error(`${dateString} -warn : ${message} - ${trace}`);
    this.logger.warn(`${message} - ${trace}`);
  }
}
