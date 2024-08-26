import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CategoriesModule } from '@api-resources/categories';
import { UserModule } from '@api-resources/user';
import { DbMnagerModule } from '@shared/db-manager';

import {
  CategoryEntity,
  MatchCategoryEntity,
  MatchEntity,
  QuestionEntity,
  UserAnswerEntity,
  UserEntity,
} from '@common/database/entities';

import { MatchController } from './match.controller';
import { MatchGateway } from './match.gateway';
import { MatchService } from './match.service';

@Module({
  imports: [
    UserModule,
    CategoriesModule,
    DbMnagerModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>(`JWT_CONFIG.secret`),
        signOptions: {
          expiresIn: configService.get<string>(`JWT_CONFIG.expiresIn`),
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      MatchEntity,
      UserEntity,
      CategoryEntity,
      MatchCategoryEntity,
      QuestionEntity,
      UserAnswerEntity,
    ]),
  ],
  controllers: [MatchController],
  providers: [MatchGateway, MatchService],
  exports: [MatchService, MatchGateway],
})
export class MatchModule {}
