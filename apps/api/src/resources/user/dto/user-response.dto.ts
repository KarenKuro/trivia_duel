import { ApiProperty } from '@nestjs/swagger';

import { CategoryResponseDTO } from '@api-resources/categories/dto';

import { UserStatus } from '@common/enums';
import { IUser } from '@common/models';

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
  categories: CategoryResponseDTO[];

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
  longestWinCount: number;

  @ApiProperty()
  currentWinCount: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
