import { IMedia } from '@common/models/media';
import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty()
  image?: IMedia | string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
