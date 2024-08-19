import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LanguagesService } from '@admin-resources/languages';

import {
  AnswerEntity,
  CategoryEntity,
  LanguageEntity,
  QuestionEntity,
  TranslatedCategoryEntity,
} from '@common/database/entities';

import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CategoryEntity,
      QuestionEntity,
      AnswerEntity,
      TranslatedCategoryEntity,
      LanguageEntity,
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
  controllers: [CategoriesController],
  providers: [CategoriesService, LanguagesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
