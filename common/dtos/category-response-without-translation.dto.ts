import { ApiProperty } from '@nestjs/swagger';

import { Expose, Transform, Type } from 'class-transformer';

import { FileHelpers } from '@common/helpers';
import { IMedia } from '@common/models/media';

import { MediaResponseDTO } from './media.response.dto';

export class CategoryResponseWithoutTranslationsDTO {
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
  @Transform(({ value }) => {
    return value && typeof value === 'object'
      ? FileHelpers.generatePath(value?.path)
      : value;
  })
  @Type(() => MediaResponseDTO)
  @ApiProperty({ type: String })
  image?: IMedia | string;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}
