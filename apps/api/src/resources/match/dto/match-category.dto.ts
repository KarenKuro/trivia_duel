import { ApiProperty } from '@nestjs/swagger';

import { Expose, Type } from 'class-transformer';

import { IdResponseDTO, MatchCategoryResponseDTO } from '@common/dtos';

export class MatchCategoryDTO {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @Type(() => IdResponseDTO)
  @ApiProperty({ type: IdResponseDTO })
  user: IdResponseDTO;

  @Expose()
  @Type(() => MatchCategoryResponseDTO)
  @ApiProperty({ type: MatchCategoryResponseDTO })
  category: MatchCategoryResponseDTO;

  @Expose()
  @Type(() => IdResponseDTO)
  @ApiProperty({ type: IdResponseDTO })
  match: IdResponseDTO;
}
