import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MatchGateway, MatchModule } from '@api-resources/match';
import { UserModule } from '@api-resources/user';

import { MatchEntity, UserAnswerEntity, UserEntity } from '@common/database';

import { TasksService } from './tasks.service';

@Module({
  imports: [
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
    TypeOrmModule.forFeature([MatchEntity, UserEntity, UserAnswerEntity]),
    MatchModule,
    UserModule,
  ],
  providers: [TasksService, MatchGateway],
})
export class TasksModule {}
