import { ApiProperty } from '@nestjs/swagger';
import { CategoryResponseDTO } from './category-response.dto';

export class CategoryWithIsActiveDTO extends CategoryResponseDTO {
  @ApiProperty()
  isActive?: boolean;
}
