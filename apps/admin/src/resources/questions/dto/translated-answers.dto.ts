import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class TranslatedAnswersDTO {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  languageId: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  translatedAnswer: string;
}
