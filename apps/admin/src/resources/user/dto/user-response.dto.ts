import { UserStatus } from '@common/enums';
import { IUser } from '@common/models';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDTO implements IUser {
  @ApiProperty()
  id: number;

  @ApiProperty()
  uid: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  status: UserStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
