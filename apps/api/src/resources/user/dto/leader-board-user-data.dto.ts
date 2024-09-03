import { ApiProperty } from '@nestjs/swagger';

import { ILeaderBoardUserData } from '@common/models';

export class LeaderBoardUserDataDTO implements ILeaderBoardUserData {
  @ApiProperty()
  id: number;

  @ApiProperty()
  position: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  points: number;

  @ApiProperty()
  avatar: string;
}
