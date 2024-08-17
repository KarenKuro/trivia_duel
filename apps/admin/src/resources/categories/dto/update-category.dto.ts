import { ApiProperty } from '@nestjs/swagger';
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
import { Type } from 'class-transformer';
import { IUpdateCategory } from '@common/models';
import { UpdateTranslatedCategoryDTO } from '.';

export class UpdateCategoryDTO implements IUpdateCategory {
  @IsString()
  @IsOptional()
  @ApiProperty()
  text: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  price: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  premiumPrice: number;

  // @IsBoolean()
  // @IsOptional()
  // @ApiProperty()
  // isExclusive?: boolean;

  @ArrayMaxSize(2)
  @ArrayMinSize(2)
  @IsArray()
  @ArrayUnique()
  @ApiProperty()
  @ValidateNested({ each: true })
  @Type(() => UpdateTranslatedCategoryDTO)
  @IsOptional()
  translatedCategories: UpdateTranslatedCategoryDTO[];
}
