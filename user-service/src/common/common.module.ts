import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { RabbitmqClient } from './rabbitmq/rabbitmq.types';
import { RabbitmqService } from './rabbitmq/rabbitmq.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { CustomConfigSchema } from './config/custom-config.schema';
import { JwtModule } from '@nestjs/jwt';
import { CustomConfigService } from './config/custom-config.service';
import { EnvKey } from './config/custom-config.enum';
import * as Producers from './rabbitmq/producers';
import { CustomLoggerService } from './logger/custom-logger.service';
import { BlacklistEntity } from '../auth/entities/blacklist.entity';
import { InitialMigration1708526496766 } from '../migrations/1708526496766-InitialMigration';
import { AddAdminMigration1708526596766 } from '../migrations/1708526596766-AddAdminMigration';

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
        migrations: [
          InitialMigration1708526496766,
          AddAdminMigration1708526596766,
        ],
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([UserEntity, BlacklistEntity]),
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>(EnvKey.JWT_SECRET),
      }),
      inject: [ConfigService],
    }),
    RabbitmqModule.registerAsync({
      clientName: RabbitmqClient.PRODUCT,
      useFactory: (configService: ConfigService) => {
        return {
          urls: [configService.get<string>(EnvKey.RABBIT_MQ_URI)],
        };
      },
      inject: [ConfigService],
    }),
    RabbitmqModule.registerAsync({
      clientName: RabbitmqClient.NOTIFICATION,
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
    JwtModule,
    CustomLoggerService,
    ...Object.values(Producers),
  ],
})
export class CommonModule {}
