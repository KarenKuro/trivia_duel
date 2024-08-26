import { ApiProperty } from '@nestjs/swagger';

import { Expose, Type } from 'class-transformer';

import { MediaResponseDTO } from './media.response.dto';
import { TranslatedCategoryResponseDTO } from './translated-category-response.dto';

export class CategoryResponseDTO {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  text: string;

  @Expose()
  @ApiProperty()
  price: number;

  @Expose()
  @ApiProperty()
  premiumPrice: number;

  // @ApiProperty()
  // isExclusive: boolean;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;

  @Expose()
  @ApiProperty({
    uniqueItems: true,
    maxItems: 2,
    minItems: 2,
  })
  translatedCategories?: TranslatedCategoryResponseDTO[];

  @Expose()
  @Type(() => String)
  @ApiProperty({ type: String })
  image?: MediaResponseDTO | string;
}
