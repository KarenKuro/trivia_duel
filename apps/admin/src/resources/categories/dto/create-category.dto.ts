import { ApiProperty } from '@nestjs/swagger';

import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { TranslatedCategoryDTO } from './translated-category.dto';

export class CreateCategoryDTO {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => {
    return value?.trim();
  })
  @ApiProperty()
  text: string;

  @IsNumber()
  @Transform(({ value }) => {
    return !isNaN(value) ? Number(value) : value;
  })
  @IsOptional()
  @ApiProperty()
  price: number;

  @IsNumber()
  @Transform(({ value }) => {
    return !isNaN(value) ? Number(value) : value;
  })
  @IsOptional()
  @ApiProperty()
  premiumPrice: number;

  // @IsBoolean()
  // @IsOptional()
  // @ApiProperty()
  // isExclusive?: boolean;

  @IsNotEmpty()
  @ArrayMaxSize(2)
  @ArrayMinSize(2)
  @IsArray()
  @ArrayUnique()
  @ApiProperty({ uniqueItems: true, maxItems: 2, minItems: 2 })
  @ValidateNested({ each: true })
  @Type(() => TranslatedCategoryDTO)
  translatedCategories: TranslatedCategoryDTO[];
}
