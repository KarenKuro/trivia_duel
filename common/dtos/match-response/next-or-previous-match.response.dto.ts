import { ApiProperty } from '@nestjs/swagger';

import { Expose } from 'class-transformer';

import { MatchLevel, MatchStatusType } from '@common/enums';

export class NextOrPreviousMatchResponseDTO {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  status: MatchStatusType;

  @Expose()
  @ApiProperty()
  matchLevel: MatchLevel;

  @Expose()
  @ApiProperty()
  againstBot: boolean;
}
