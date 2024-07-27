import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {
  AnswerEntity,
  CategoryEntity,
  QuestionEntity,
  UserEntity,
} from '@common/database/entities';
import { FacebookStrategy, GoogleStrategy } from '@common/strategies';

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
