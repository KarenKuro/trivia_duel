import { ApiProperty } from '@nestjs/swagger';

import { CategoryResponseWithoutTranslationsDTO } from '@admin-resources/categories/dto';

import { StatisticsResponseDTO } from '@common/dtos';
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
  categories: CategoryResponseWithoutTranslationsDTO[];

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
  statistics: StatisticsResponseDTO;
}
