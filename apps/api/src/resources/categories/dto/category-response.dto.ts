import {
  MediaResponseDTO,
  TranslatedCategoryResponseDTO,
} from '@admin-resources/categories/dto';
import { ApiProperty } from '@nestjs/swagger';

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
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({
    uniqueItems: true,
    maxItems: 2,
    minItems: 2,
  })
  translatedCategories?: TranslatedCategoryResponseDTO[];

  // @Transform((medias) => {
  //   return medias.value.map(({ path }) => {
  //     console.log('value', path);
  //     return path.path;
  //   });
  // })
  // @Transform(({ value }) => {
  //   return value.map((media: IMedia) => media.path);
  // })
  // @ApiProperty({ type: [String] })
  // medias?: string[];
  @ApiProperty()
  medias?: MediaResponseDTO[];
}
