import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LanguagesService } from '@admin-resources/languages';
import { FileService } from '@shared/file/file.service';

import {
  AnswerEntity,
  CategoryEntity,
  LanguageEntity,
  MediaEntity,
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
      MediaEntity,
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
  providers: [CategoriesService, LanguagesService, FileService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
