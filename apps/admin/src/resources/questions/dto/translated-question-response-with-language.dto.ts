import { ApiProperty } from '@nestjs/swagger';

import { LanguageResponseDTO } from '@common/dtos';

export class TranslatedQuestionResponseWithLanguageDTO {
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
