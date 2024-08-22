import { ApiProperty } from '@nestjs/swagger';
import { MediaResponseDTO } from './media.response.dto';

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
  medias?: MediaResponseDTO[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
