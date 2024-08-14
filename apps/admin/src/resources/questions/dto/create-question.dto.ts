import { ValidateIsInclude } from '@common/decorators';
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
} from 'class-validator';

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  question: string;

  @ArrayMaxSize(4)
  @ArrayMinSize(4)
  @ArrayUnique()
  @IsString({ each: true })
  @IsArray()
  @IsNotEmpty()
  @ApiProperty()
  answers: string[];

  @ValidateIsInclude({
    context: 'answers',
  })
  @IsString()
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
