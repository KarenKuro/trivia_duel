import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';

import { join } from 'path';

import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';

import { LanguagesModule } from '@admin-resources/languages';

import { appConfig, databaseConfiguration, jwtConfig } from '@common/config';
import { ENV_CONST } from '@common/constants';
import {
  MatchCategoryEntity,
  MatchEntity,
  MediaEntity,
  UserAnswerEntity,
} from '@common/database/entities';
import { NodeEnv } from '@common/enums';
import { ADMIN_VALIDATIONS } from '@common/validators';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import {
  AnswersModule,
  AuthModule,
  CategoriesModule,
  QuestionsModule,
} from './resources';
import { UserModule } from './resources/user/user.module';

const isProductionMode = process.env.NODE_ENV === NodeEnv.production;

const envFilePath = isProductionMode
  ? ENV_CONST.ENV_PATH_PROD
  : ENV_CONST.ENV_PATH_DEV;

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', '..', 'uploads'), // Путь к папке uploads
      serveRoot: '/uploads', // URL-адрес, по которому файлы будут доступны
    }),
    AuthModule,
    CategoriesModule,
    QuestionsModule,
    AnswersModule,
    UserModule,
    LanguagesModule,
    ConfigModule.forRoot({
      envFilePath,
      isGlobal: true,
      expandVariables: true,
      validationSchema: ADMIN_VALIDATIONS,
      load: [databaseConfiguration, jwtConfig, appConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [
        ConfigModule,
        AuthModule,
        CategoriesModule,
        QuestionsModule,
        UserModule,
        LanguagesModule,
      ],
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
            MatchEntity,
            UserAnswerEntity,
            MatchCategoryEntity,
            MediaEntity,
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
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
