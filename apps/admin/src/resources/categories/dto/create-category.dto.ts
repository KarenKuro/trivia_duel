import { ICreateCategory } from '@common/models';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCategoryDTO implements ICreateCategory {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  price: number;

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  isExclusive?: boolean;
}
