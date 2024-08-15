import { ApiProperty } from '@nestjs/swagger';

import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateQuestionDTO {
  @IsString()
  @ApiProperty()
  question: string;

  @ArrayMaxSize(4)
  @ArrayUnique()
  @IsArray()
  @IsOptional()
  @ApiProperty()
  answers?: AnswerDTO[];

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  correctAnswerId?: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  categoryId?: number;
}

export class AnswerDTO {
  @IsNumber()
  @ApiProperty()
  id: number;

  @IsString()
  @ApiProperty()
  value: string;
}
