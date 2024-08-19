import { ApiProperty } from '@nestjs/swagger';

import { IsBoolean } from 'class-validator';

import { CategoryResponseDTO } from './category-response.dto';

export class CategoryWithIsActiveDTO extends CategoryResponseDTO {
  @ApiProperty()
  // @Transform(({ value }) => value === '1')
  @IsBoolean()
  isActive?: boolean;
}
