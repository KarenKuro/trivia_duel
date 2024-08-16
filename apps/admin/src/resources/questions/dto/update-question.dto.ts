import { IUpdateQuestion } from '@common/models';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class UpdateQuestionDTO implements IUpdateQuestion {
  @IsString()
  @ApiProperty()
  text: string;

  @ArrayMaxSize(4)
  @ArrayUnique()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateAnswerDTO)
  @IsOptional()
  @ApiProperty()
  answers?: UpdateAnswerDTO[];

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  correctAnswerId?: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  categoryId?: number;

  @IsArray()
  @ArrayUnique()
  @ApiProperty()
  @ValidateNested({ each: true })
  @Type(() => UpdateTranslatedQuestionDTO)
  @IsOptional()
  @ApiProperty()
  translatedQuestions?: UpdateTranslatedQuestionDTO[];
}

export class UpdateTranslatedQuestionDTO {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  id: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  text: string;
}

export class UpdateAnswerDTO {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  id: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  text: string;

  @ArrayUnique()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateTranslatedAnswerDTO)
  @IsOptional()
  @ApiProperty()
  translatedAnswers?: UpdateTranslatedAnswerDTO[];
}

export class UpdateTranslatedAnswerDTO {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  id: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  text: string;
}
