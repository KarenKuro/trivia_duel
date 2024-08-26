import { ApiProperty } from '@nestjs/swagger';

import { MatchStatusType } from '@common/enums';

export class MatchStartResponseDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  status: MatchStatusType;
}
