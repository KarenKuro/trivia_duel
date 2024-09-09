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
  botName: string;

  @ApiProperty()
  startedAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
