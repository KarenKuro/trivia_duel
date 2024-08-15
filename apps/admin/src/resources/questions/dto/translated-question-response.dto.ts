import { ApiProperty } from '@nestjs/swagger';

export class TranslatedQuestionResponseDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  translatedQuestion: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
