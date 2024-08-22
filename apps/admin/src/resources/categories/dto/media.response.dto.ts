import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { CategoryResponseDTO } from './category-response.dto';

export class MediaResponseDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  path: string;
  
  @ApiHideProperty()
  category: CategoryResponseDTO;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
