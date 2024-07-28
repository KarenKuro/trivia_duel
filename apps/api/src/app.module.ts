import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { API_VALIDATIONS } from '@common/validators';
import { ENV_CONST } from '@common/constants';
import { NodeEnv } from '@common/enums';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import {
  appConfig,
  databaseConfiguration,
  facebookConfig,
  googleConfig,
  jwtConfig,
} from '@common/config';
import { AuthModule } from '@api-resources/auth';
import { CategoriesModule } from '@api-resources/categories/categories.module';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { UserModule } from './resources/user/user.module';

const isProductionMode = process.env.NODE_ENV === NodeEnv.production;

const envFilePath = isProductionMode
  ? ENV_CONST.ENV_PATH_PROD
  : ENV_CONST.ENV_PATH_DEV;

@Module({
  imports: [
    AuthModule,
    CategoriesModule,
    UserModule,
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
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
