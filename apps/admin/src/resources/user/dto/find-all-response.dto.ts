import { MetaResponseDTO } from '@common/dtos';
import { UserResponseDTO } from './user-response.dto';
import { ApiProperty } from '@nestjs/swagger';

export class AllUsersResponseDTO {
  @ApiProperty()
  users: UserResponseDTO[];
  @ApiProperty()
  meta: MetaResponseDTO;
}
