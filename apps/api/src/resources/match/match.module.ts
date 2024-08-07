import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import {
  CategoryEntity,
  MatchCategoryEntity,
  MatchEntity,
  QuestionEntity,
  UserAnswerEntity,
  UserEntity,
} from '@common/database/entities';
import { MatchService } from './match.service';
import { MatchGateway } from './match.gateway';
import { MatchController } from './match.controller';
import { UserModule } from '@api-resources/user';
import { CategoriesModule } from '@api-resources/categories';

@Module({
  imports: [
    UserModule,
    CategoriesModule,
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
