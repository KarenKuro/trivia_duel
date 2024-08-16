import { ICreateCategory } from '@common/models';
import { ApiProperty } from '@nestjs/swagger';
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
import { Type } from 'class-transformer';

export class CreateCategoryDTO implements ICreateCategory {
  @IsNotEmpty()
  @IsString()
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

  @IsNotEmpty()
  @ArrayMaxSize(2)
  @ArrayMinSize(2)
  @IsArray()
  @ArrayUnique()
  @ApiProperty()
  @ValidateNested({ each: true })
  @Type(() => TranslatedCategoryDTO)
  translatedCategories: TranslatedCategoryDTO[];
}
