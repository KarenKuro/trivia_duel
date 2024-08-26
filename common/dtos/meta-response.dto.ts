import { ApiProperty } from '@nestjs/swagger';

import { IMetaResponse } from '@common/models';

export class MetaResponseDTO implements IMetaResponse {
  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  offset: number;

  @ApiProperty()
  currentPage: number;

  @ApiProperty()
  hasPrev: boolean;

  @ApiProperty()
  hasNext: boolean;

  @ApiProperty()
  pageCount: number;
}
