import { ApiProperty } from '@nestjs/swagger';

import { LanguageResponseDTO } from '@admin-resources/languages/dto';

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
