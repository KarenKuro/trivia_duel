import { ApiProperty } from '@nestjs/swagger';

import { MetaResponseDTO } from '@common/dtos';

import { UserResponseDTO } from './user-response.dto';

export class AllUsersResponseDTO {
  @ApiProperty()
  users: UserResponseDTO[];
  @ApiProperty()
  meta: MetaResponseDTO;
}
