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

import { IUpdateCategory } from '@common/models';

import { UpdateMediaDTO, UpdateTranslatedCategoryDTO } from '.';

export class UpdateCategoryDTO implements IUpdateCategory {
  @IsString()
  @IsOptional()
  @Transform(({ value }) => {
    return value?.trim();
  })
  @ApiPropertyOptional()
  text: string;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  price: number;

  @IsNumber()
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

  @IsArray()
  @ArrayUnique()
  @ValidateNested({ each: true })
  @Type(() => UpdateMediaDTO)
  @IsOptional()
  @ApiPropertyOptional({ uniqueItems: true })
  medias: UpdateMediaDTO[];
}
