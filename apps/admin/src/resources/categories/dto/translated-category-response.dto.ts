import { ApiProperty } from '@nestjs/swagger';
import { CategoryResponseDTO } from './category-response.dto';
import { LanguageResponseDTO } from '@admin-resources/languages/dto';

export class TranslatedCategoryResponseDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  translatedName: string;

  @ApiProperty()
  category: CategoryResponseDTO;

  @ApiProperty()
  language: LanguageResponseDTO;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
