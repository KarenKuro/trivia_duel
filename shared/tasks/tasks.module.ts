import { MatchEntity } from '@common/database';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { MatchGateway, MatchModule } from '@api-resources/match';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

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
    TypeOrmModule.forFeature([MatchEntity]),
    MatchModule,
  ],
  providers: [TasksService, MatchGateway],
})
export class TasksModule {}