import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import {
  AnswerEntity,
  CategoryEntity,
  LanguageEntity,
  QuestionEntity,
  TranslatedCategoryEntity,
} from '@common/database/entities';
import { LanguagesService } from '@admin-resources/languages';

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
