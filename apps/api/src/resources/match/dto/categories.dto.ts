import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';

export class CategoriesDTO {
  @IsNumber({}, { each: true })
  @IsArray()
  @ApiProperty()
  categories: number[];
}
