import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { RabbitmqClient } from './rabbitmq/rabbitmq.types';
import { RabbitmqService } from './rabbitmq/rabbitmq.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomConfigSchema } from './config/custom-config.schema';
import { CustomConfigService } from './config/custom-config.service';
import { EnvKey } from './config/custom-config.enum';
import * as Producers from './rabbitmq/producers';
import { CustomLoggerService } from './logger/custom-logger.service';
import { ProductEntity } from '../products/entities/product.entity';
import { InitialMigration1708535768107 } from '../migrations/1708535768107-initialMigration';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: CustomConfigSchema,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>(EnvKey.DATABASE_HOST),
        port: configService.get<number>(EnvKey.DATABASE_PORT),
        username: configService.get<string>(EnvKey.DATABASE_USER),
        password: configService.get<string>(EnvKey.DATABASE_PASSWORD),
        database: configService.get<string>(EnvKey.DATABASE_NAME),
        autoLoadEntities: true,
        synchronize: false,
        migrations: [InitialMigration1708535768107],
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([ProductEntity]),
    RabbitmqModule.registerAsync({
      clientName: RabbitmqClient.USER,
      useFactory: (configService: ConfigService) => {
        return {
          urls: [configService.get<string>(EnvKey.RABBIT_MQ_URI)],
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [
    RabbitmqService,
    CustomConfigService,
    CustomLoggerService,
    ...Object.values(Producers),
  ],
  exports: [
    RabbitmqService,
    CustomConfigService,
    RabbitmqModule,
    TypeOrmModule,
    CustomLoggerService,
    ...Object.values(Producers),
  ],
})
export class CommonModule {}
