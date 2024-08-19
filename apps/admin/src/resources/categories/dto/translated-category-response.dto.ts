import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { CategoryResponseDTO } from './category-response.dto';
import { LanguageResponseDTO } from '@admin-resources/languages/dto';

export class TranslatedCategoryResponseDTO {
  @ApiProperty()
  text: string;

  // @ApiProperty({ type: () => Object, properties: { id: { type: 'number' } } })
  @ApiHideProperty()
  category: CategoryResponseDTO;

  @ApiProperty()
  language: LanguageResponseDTO;

  @ApiProperty()
  id: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
