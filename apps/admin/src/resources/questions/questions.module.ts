import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AnswersModule } from '@admin-resources/answers';
import { CategoriesModule } from '@admin-resources/categories';
import { LanguagesService } from '@admin-resources/languages';

import {
  AnswerEntity,
  CategoryEntity,
  LanguageEntity,
  QuestionEntity,
  TranslatedAnswerEntity,
  TranslatedQuestionEntity,
} from '@common/database/entities';

import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';

@Module({
  imports: [
    AnswersModule,
    CategoriesModule,
    TypeOrmModule.forFeature([
      CategoryEntity,
      QuestionEntity,
      AnswerEntity,
      LanguageEntity,
      TranslatedQuestionEntity,
      TranslatedAnswerEntity,
    ]),
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
  providers: [QuestionsService, LanguagesService],
  exports: [QuestionsService],
})
export class QuestionsModule {}
