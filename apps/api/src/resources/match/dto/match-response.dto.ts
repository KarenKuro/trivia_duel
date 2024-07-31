import { UserResponseDTO } from '@admin-resources/user/dto';
import { MatchLevel, MatchStatusType } from '@common/enums';
import { ApiProperty } from '@nestjs/swagger';

export class MatchResponseDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  status: MatchStatusType;

  @ApiProperty()
  users: UserResponseDTO[];

  @ApiProperty()
  matchLevel: MatchLevel;
  // categories:
  // questions:
  // lastAnswer:
  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
