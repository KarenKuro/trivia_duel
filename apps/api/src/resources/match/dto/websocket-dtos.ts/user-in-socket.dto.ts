import { ApiProperty } from '@nestjs/swagger';

import { UserStatus } from '@common/enums';

export class UserInSocketDTO {
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
  coins: number;

  @ApiProperty()
  premiumCoins: number;

  @ApiProperty()
  subscription: boolean;

  @ApiProperty()
  level: number;

  @ApiProperty()
  points: number;

  @ApiProperty()
  tickets: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  avatar?: string;
}
