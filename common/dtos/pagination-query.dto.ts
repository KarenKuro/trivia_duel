import { ApiProperty } from '@nestjs/swagger';

import { IsNumberString } from 'class-validator';

import { IPagination } from '@common/models';

export class PaginationQueryDTO implements IPagination {
  @ApiProperty()
  @IsNumberString()
  offset = '0';

  @ApiProperty()
  @IsNumberString()
  limit = '100';
}
