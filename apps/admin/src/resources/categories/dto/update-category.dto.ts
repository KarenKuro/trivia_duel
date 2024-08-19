import { ApiPropertyOptional } from '@nestjs/swagger';
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
import { Transform, Type } from 'class-transformer';
import { IUpdateCategory } from '@common/models';
import { UpdateTranslatedCategoryDTO } from '.';

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
  @ApiPropertyOptional({ uniqueItems: true, minItems: 0, maxItems: 2 })
  @ValidateNested({ each: true })
  @Type(() => UpdateTranslatedCategoryDTO)
  @IsOptional()
  translatedCategories: UpdateTranslatedCategoryDTO[];
}
