import { ApiProperty } from '@nestjs/swagger';

import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { TranslatedAnswerResponseDTO } from './translated-answer-response.dto';

export class UpdateQuestionDTO {
  @IsString()
  @ApiProperty()
  question?: string;

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

  @ApiProperty({ type: () => TranslatedAnswerResponseDTO, isArray: true })
  translatedAnswers?: TranslatedAnswerResponseDTO[];
}

export class CorrectAnswerDTO {
  @IsNumber()
  @ApiProperty()
  id: number;

  @IsString()
  @ApiProperty()
  value: string;
}
