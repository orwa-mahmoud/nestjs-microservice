import { NestFactory } from '@nestjs/core';
import * as cors from 'cors';
import { AppModule } from './app.module';
import { MicroserviceOptions } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { EnvKey } from './common/config/custom-config.enum';
import { RabbitmqClient } from './common/rabbitmq/rabbitmq.types';
import { RabbitmqService } from './common/rabbitmq/rabbitmq.service';
import { ValidationPipe } from '@nestjs/common';
import { rc } from './common/response/response-container';
import { DataSource } from 'typeorm';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const dataSource = app.get<DataSource>(DataSource);
  await dataSource.runMigrations();
  const configService = app.get(ConfigService);
  // Set up microservices
  const rmqService = app.get<RabbitmqService>(RabbitmqService);

  app.connectMicroservice<MicroserviceOptions>(
    rmqService.getOptions({
      queue: RabbitmqClient.PRODUCT,
      urls: [configService.get<string>(EnvKey.RABBIT_MQ_URI)],
    }),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      exceptionFactory: (validationErrors) => {
        return rc().errorInValid(validationErrors);
      },
    }),
  );
  app.use(cookieParser());

  const allowedOrigins = configService
    .get<string>(EnvKey.ALLOWED_ORIGINS)
    .split(',');
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      },
      credentials: true,
    }),
  );

  // Start microservices
  await app.startAllMicroservices();

  // Start HTTP server

  await app.listen(configService.get(EnvKey.NODE_PORT));
}
bootstrap();
