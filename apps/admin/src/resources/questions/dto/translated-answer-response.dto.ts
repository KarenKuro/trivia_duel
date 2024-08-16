import { ApiProperty } from '@nestjs/swagger';

export class TranslatedAnswerResponseDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  text: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
