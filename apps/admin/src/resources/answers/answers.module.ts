import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AnswersService } from './answers.service';
import {
  AnswerEntity,
  CategoryEntity,
  QuestionEntity,
} from '@common/database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([CategoryEntity, QuestionEntity, AnswerEntity]),
  ],
  //controllers: [AnswersController],
  providers: [AnswersService],
  exports: [AnswersService],
})
export class AnswersModule {}
