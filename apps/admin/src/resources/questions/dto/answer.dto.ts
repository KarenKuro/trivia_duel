import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { TranslatedAnswerResponseDTO } from './translated-answer-response.dto';

export class AnswerDTO {
  @IsNumber()
  @ApiProperty()
  id: number;

  @IsString()
  @ApiProperty()
  text: string;

  @ApiProperty({ type: () => TranslatedAnswerResponseDTO, isArray: true })
  translatedAnswers?: TranslatedAnswerResponseDTO[];
}
