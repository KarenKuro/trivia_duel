import { IUpdateQuestion } from '@common/models';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

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
  @Transform(({ value }) => {
    return value?.trim();
  })
  @ApiProperty()
  text: string;

  @ArrayMaxSize(4)
  @ArrayUnique()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateAnswerDTO)
  @IsOptional()
  @ApiProperty({ uniqueItems: true, minItems: 1, maxItems: 4 })
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
  @ApiProperty({ uniqueItems: true, minItems: 0, maxItems: 2 })
  translatedQuestions?: UpdateTranslatedQuestionDTO[];
}

export class UpdateTranslatedQuestionDTO {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  id: number;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => {
    return value?.trim();
  })
  @ApiProperty()
  text: string;
}

export class UpdateAnswerDTO {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  id: number;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => {
    return value?.trim();
  })
  @ApiProperty()
  text: string;

  @ArrayUnique()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateTranslatedAnswerDTO)
  @IsOptional()
  @ApiProperty({ uniqueItems: true, minItems: 0, maxItems: 2 })
  translatedAnswers?: UpdateTranslatedAnswerDTO[];
}

export class UpdateTranslatedAnswerDTO {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  id: number;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => {
    return value?.trim();
  })
  @ApiProperty()
  text: string;
}
