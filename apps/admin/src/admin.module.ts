import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { addTransactionalDataSource } from 'typeorm-transactional';

import { ADMIN_VALIDATIONS } from '@common/validators';
import { ENV_CONST } from '@common/constants';
import { NodeEnv } from '@common/enums';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { appConfig, databaseConfiguration, jwtConfig } from '@common/config';
import {
  AnswersModule,
  AuthModule,
  CategoriesModule,
  QuestionsModule,
} from './resources';

const isProductionMode = process.env.NODE_ENV === NodeEnv.production;

const envFilePath = isProductionMode
  ? ENV_CONST.ENV_PATH_PROD
  : ENV_CONST.ENV_PATH_DEV;

@Module({
  imports: [
    AuthModule,
    CategoriesModule,
    QuestionsModule,
    AnswersModule,
    ConfigModule.forRoot({
      envFilePath,
      isGlobal: true,
      expandVariables: true,
      validationSchema: ADMIN_VALIDATIONS,
      load: [databaseConfiguration, jwtConfig, appConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, AuthModule, CategoriesModule],
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
          entities: [],
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
