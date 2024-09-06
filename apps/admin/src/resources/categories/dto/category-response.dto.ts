import { ApiProperty } from '@nestjs/swagger';

import { IMedia } from '@common/models/media';

import { TranslatedCategoryResponseDTO } from './translated-category-response.dto';

export class CategoryResponseDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  text: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  premiumPrice: number;

  // @ApiProperty()
  // isExclusive: boolean;

  @ApiProperty({
    example:
      'localhost:3007/uploads/categories/5284d013-93fa-425d-8af6-7d2cefdcc7da.png',
  })
  image?: IMedia | string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ uniqueItems: true, maxItems: 2, minItems: 2 })
  translatedCategories?: TranslatedCategoryResponseDTO[];
}
