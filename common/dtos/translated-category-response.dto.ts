import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

import { Expose, Type } from 'class-transformer';

import { CategoryResponseDTO } from './category-response.dto';
import { LanguageResponseDTO } from './language-response.dto';

export class TranslatedCategoryResponseDTO {
  @Expose()
  @ApiProperty()
  text: string;

  // @ApiProperty({ type: () => Object, properties: { id: { type: 'number' } } })
  @ApiHideProperty()
  category: CategoryResponseDTO;

  @Expose()
  @Type(() => LanguageResponseDTO)
  @ApiProperty()
  language: LanguageResponseDTO;

  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}
