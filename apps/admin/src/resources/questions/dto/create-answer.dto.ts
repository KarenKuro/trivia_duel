import { ICreateAnswer } from '@common/models/question/create-answer';
import { TranslatedAnswersDTO } from './translated-answers.dto';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAnswerDTO implements ICreateAnswer {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  text: string;

  @IsArray()
  @IsNotEmpty()
  @ApiProperty()
  translatedAnswers: TranslatedAnswersDTO[];
}
