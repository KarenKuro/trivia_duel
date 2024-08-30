import { ApiProperty } from '@nestjs/swagger';

import { MatchLevel, MatchStatusType } from '@common/enums';

export class NextMatchDataToSendDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  status: MatchStatusType;

  @ApiProperty()
  matchLevel: MatchLevel;

  @ApiProperty()
  againstBot: boolean;

  @ApiProperty()
  startedAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
