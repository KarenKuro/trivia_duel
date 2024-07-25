import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import {
  AnswerEntity,
  CategoryEntity,
  QuestionEntity,
} from '@common/database/entities';
import { AnswersModule } from '@admin-resources/answers';
import { CategoriesModule } from '@admin-resources/categories';

@Module({
  imports: [
    AnswersModule,
    CategoriesModule,
    TypeOrmModule.forFeature([CategoryEntity, QuestionEntity, AnswerEntity]),
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
  controllers: [QuestionsController],
  providers: [QuestionsService],
  exports: [QuestionsService],
})
export class QuestionsModule {}
