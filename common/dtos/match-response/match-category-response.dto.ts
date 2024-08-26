import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

import { Expose, Transform, Type } from 'class-transformer';

import { MediaResponseDTO, TranslatedCategoryResponseDTO } from '@common/dtos';
import { FileHelpers } from '@common/helpers';

export class MatchCategoryResponseDTO {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  text: string;

  @ApiHideProperty()
  price: number;

  @ApiHideProperty()
  premiumPrice: number;

  // @ApiProperty()
  // isExclusive: boolean;

  @ApiHideProperty()
  createdAt: Date;

  @ApiHideProperty()
  updatedAt: Date;

  @ApiHideProperty()
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
