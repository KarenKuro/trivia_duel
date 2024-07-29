import { ApiProperty } from '@nestjs/swagger';
import { CategoryResponseDTO } from './category-response.dto';
import { IsBoolean } from 'class-validator';

export class CategoryWithIsActiveDTO extends CategoryResponseDTO {
  @ApiProperty()
  // @Transform(({ value }) => value === '1')
  @IsBoolean()
  isActive?: boolean;
}
