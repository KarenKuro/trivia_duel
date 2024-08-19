import { ApiProperty } from '@nestjs/swagger';

import { UserResponseDTO } from '@admin-resources/user/dto';
import { CategoryResponseDTO } from '@api-resources/categories/dto';

import { MatchResponseDTO } from './match-response.dto';

export class MatchCategoryDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  user: UserResponseDTO;

  @ApiProperty()
  category: CategoryResponseDTO;

  @ApiProperty()
  match: MatchResponseDTO;
}
