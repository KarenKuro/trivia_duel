import { ApiProperty } from '@nestjs/swagger';

import { TranslatedCategoryResponseDTO } from './translated-category-response.dto';
import { IMedia } from '@common/models/media';

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

  @ApiProperty()
  image?: IMedia | string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ uniqueItems: true, maxItems: 2, minItems: 2 })
  translatedCategories?: TranslatedCategoryResponseDTO[];
}
