import { ApiProperty } from '@nestjs/swagger';

import { IMedia } from '@common/models/media';

export class CategoryResponseWithoutTranslationsDTO {
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

  @ApiProperty({ type: String })
  image?: IMedia | string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
