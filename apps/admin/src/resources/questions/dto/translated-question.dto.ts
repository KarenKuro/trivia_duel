import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class TranslatedQuestionDTO {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  languageId: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  translatedQuestion: string;
}
