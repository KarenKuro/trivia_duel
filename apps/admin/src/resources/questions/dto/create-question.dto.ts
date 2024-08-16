import { ValidateIsAnswerIncluded } from '@common/decorators';
import { QuestionType } from '@common/enums';
import { ApiProperty } from '@nestjs/swagger';
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
import { TranslatedQuestionDTO } from './translated-question.dto';
import { CreateAnswerDTO } from './create-answer.dto';
import { ValidateIsAnswersUnique } from '@common/decorators/is-answers-unique.decorator';
import { Type } from 'class-transformer';

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  text: string;

  @IsNotEmpty()
  @IsArray()
  @ArrayUnique()
  @ApiProperty()
  @ValidateNested({ each: true })
  @Type(() => TranslatedQuestionDTO)
  translatedQuestion: TranslatedQuestionDTO[];

  @ArrayMaxSize(4)
  @ArrayMinSize(1)
  @ValidateIsAnswersUnique()
  @IsArray()
  @ArrayUnique()
  @IsNotEmpty()
  @ApiProperty()
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
