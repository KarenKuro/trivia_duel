import { UserResponseDTO } from '@admin-resources/user/dto';
import { CategoryResponseDTO } from '@api-resources/categories/dto';
import { MatchResponseDTO } from './match-response.dto';
import { ApiProperty } from '@nestjs/swagger';

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
