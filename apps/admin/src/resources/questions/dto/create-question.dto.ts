import { ApiProperty } from '@nestjs/swagger';

import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

import { ValidateIsAnswerIncluded } from '@common/decorators';
import { ValidateIsAnswersUnique } from '@common/decorators/is-answers-unique.decorator';
import { QuestionType } from '@common/enums';

import { CreateAnswerDTO } from './create-answer.dto';
import { TranslatedQuestionDTO } from './translated-question.dto';

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => {
    return value?.trim();
  })
  @ApiProperty()
  text: string;

  @IsNotEmpty()
  @IsArray()
  @ArrayUnique()
  @ApiProperty({ uniqueItems: true, maxItems: 2, minItems: 2 })
  @ValidateNested({ each: true })
  @Type(() => TranslatedQuestionDTO)
  translatedQuestion: TranslatedQuestionDTO[];

  @ArrayMaxSize(4)
  @ArrayMinSize(1)
  @ValidateIsAnswersUnique()
  @IsArray()
  @ArrayUnique()
  @IsNotEmpty()
  @ApiProperty({ uniqueItems: true, maxItems: 1, minItems: 4 })
  @ValidateNested({ each: true })
  @Type(() => CreateAnswerDTO)
  answers: CreateAnswerDTO[];

  @ValidateIsAnswerIncluded()
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  correctAnswer: string;

  @IsEnum(QuestionType)
  @IsNotEmpty()
  @ApiProperty()
  type: QuestionType;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  categoryId: number;
}
