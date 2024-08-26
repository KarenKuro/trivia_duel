import { ApiProperty } from '@nestjs/swagger';

import { Expose, Transform, Type } from 'class-transformer';

import { MediaResponseDTO, TranslatedCategoryResponseDTO } from '@common/dtos';
import { FileHelpers } from '@common/helpers';

export class CategoryResponseDTO {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  text: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  premiumPrice: number;

  // @ApiProperty()
  // isExclusive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({
    uniqueItems: true,
    maxItems: 2,
    minItems: 2,
  })
  translatedCategories?: TranslatedCategoryResponseDTO[];

  @Expose()
  @Transform(({ value }) => {
    return value && typeof value === 'object'
      ? FileHelpers.generatePath(value?.path)
      : value;
  })
  @Type(() => MediaResponseDTO)
  @ApiProperty({ type: String })
  image?: MediaResponseDTO | string;
}
