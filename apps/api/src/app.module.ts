import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';

import { join } from 'path';

import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';

import { LanguagesModule } from '@api-resources/languages/languages.module';
import { TasksModule } from '@shared/tasks';

import {
  appConfig,
  databaseConfiguration,
  facebookConfig,
  googleConfig,
  jwtConfig,
  // redisConfig,
} from '@common/config';
import { ENV_CONST } from '@common/constants';
import {
  LanguageEntity,
  MediaEntity,
  TranslatedAnswerEntity,
  TranslatedCategoryEntity,
  TranslatedQuestionEntity,
} from '@common/database/entities';
import { NodeEnv } from '@common/enums';
import { API_VALIDATIONS } from '@common/validators';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  AuthModule,
  CategoriesModule,
  MatchModule,
  UserModule,
} from './resources';

const isProductionMode = process.env.NODE_ENV === NodeEnv.production;

const envFilePath = isProductionMode
  ? ENV_CONST.ENV_PATH_PROD
  : ENV_CONST.ENV_PATH_DEV;

@Module({
  imports: [
    AuthModule,
    CategoriesModule,
    UserModule,
    MatchModule,
    TasksModule,
    LanguagesModule,
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath,
      isGlobal: true,
      expandVariables: true,
      validationSchema: API_VALIDATIONS,
      load: [
        appConfig,
        databaseConfiguration,
        facebookConfig,
        jwtConfig,
        googleConfig,
        // redisConfig,
      ],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, AuthModule, UserModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'mysql',
          host: configService.get<string>(`DB_CONFIG.host`),
          port: configService.get<number>(`DB_CONFIG.port`),
          username: configService.get<string>(`DB_CONFIG.username`),
          password: configService.get<string>(`DB_CONFIG.password`),
          database: configService.get<string>(`DB_CONFIG.database`),
          autoLoadEntities: true,
          // entities: ['dist/**/*.entity{.ts,.js}'],
          // Do not use synchronize in production mode
          // https://docs.nestjs.com/techniques/database
          synchronize: configService.get<boolean>(`DB_CONFIG.sync`),
          entities: [
            TranslatedAnswerEntity,
            TranslatedCategoryEntity,
            TranslatedQuestionEntity,
            MediaEntity,
            LanguageEntity,
          ],
        };
      },
      async dataSourceFactory(options) {
        if (!options) {
          throw new Error('Invalid options passed');
        }
        return addTransactionalDataSource(new DataSource(options));
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', '..', 'uploads'), // Путь к папке uploads
      serveRoot: '/uploads', // URL-адрес, по которому файлы будут доступны
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
