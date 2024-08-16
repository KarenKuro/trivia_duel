import { ICreateAnswer } from '@common/models/question/create-answer';
import { TranslatedAnswerDTO } from './translated-answers.dto';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateAnswerDTO implements ICreateAnswer {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  text: string;

  @IsArray()
  @IsNotEmpty()
  @ApiProperty()
  @ValidateNested({ each: true })
  @Type(() => TranslatedAnswerDTO)
  translatedAnswers: TranslatedAnswerDTO[];
}
