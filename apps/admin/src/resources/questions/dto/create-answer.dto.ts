import { ICreateAnswer } from '@common/models/question/create-answer';
import { TranslatedAnswerDTO } from './translated-answers.dto';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class CreateAnswerDTO implements ICreateAnswer {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => {
    return value?.trim();
  })
  @ApiProperty()
  text: string;

  @IsArray()
  @IsNotEmpty()
  @ApiProperty({ uniqueItems: true, maxItems: 2, minItems: 2 })
  @ValidateNested({ each: true })
  @Type(() => TranslatedAnswerDTO)
  translatedAnswers: TranslatedAnswerDTO[];
}
