import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  AnswerEntity,
  CategoryEntity,
  QuestionEntity,
} from '@common/database/entities';

import { AnswersService } from './answers.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CategoryEntity, QuestionEntity, AnswerEntity]),
  ],
  providers: [AnswersService],
  exports: [AnswersService],
})
export class AnswersModule {}
