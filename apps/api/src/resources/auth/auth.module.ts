import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  AnswerEntity,
  CategoryEntity,
  QuestionEntity,
  UserEntity,
} from '@common/database/entities';
import { FacebookStrategy, GoogleStrategy } from '@common/strategies';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      CategoryEntity,
      QuestionEntity,
      AnswerEntity,
    ]),

    PassportModule.register({
      defaultStrategy: ['facebook', 'google'],
    }),

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
  ],

  controllers: [AuthController],
  providers: [AuthService, FacebookStrategy, GoogleStrategy],
  exports: [AuthService],
})
export class AuthModule {}
