import { ApiProperty } from '@nestjs/swagger';

import { LanguageResponseDTO } from './language-response.dto';

export class TranslatedAnswerResponseDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  text: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: LanguageResponseDTO })
  language: LanguageResponseDTO;
}
