import { ApiPropertyOptional } from '@nestjs/swagger';

import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { UpdateTranslatedCategoryDTO } from './update-translated-category.dto';


export class UpdateCategoryDTO  {
  @IsString()
  @IsOptional()
  @Transform(({ value }) => {
    return value?.trim();
  })
  @ApiPropertyOptional()
  text: string;

  @IsNumber()
  @Transform(({ value }) => {
    return !isNaN(value) ? Number(value) : value;
  })
  @IsOptional()
  @ApiPropertyOptional()
  price: number;

  @IsNumber()
  @Transform(({ value }) => {
    return !isNaN(value) ? Number(value) : value;
  })
  @IsOptional()
  @ApiPropertyOptional()
  premiumPrice: number;

  // @IsBoolean()
  // @IsOptional()
  // @ApiProperty()
  // isExclusive?: boolean;

  @ArrayMaxSize(2)
  @ArrayMinSize(0)
  @IsArray()
  @ArrayUnique()
  @ValidateNested({ each: true })
  @Type(() => UpdateTranslatedCategoryDTO)
  @IsOptional()
  @ApiPropertyOptional({ uniqueItems: true, minItems: 0, maxItems: 2 })
  translatedCategories: UpdateTranslatedCategoryDTO[];
}
