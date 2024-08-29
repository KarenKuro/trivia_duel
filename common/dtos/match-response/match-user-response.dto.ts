import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

import { Exclude, Expose, Type } from 'class-transformer';

import { CategoryResponseDTO } from '@api-resources/categories/dto';
import { StatisticsResponseDTO } from '@api-resources/user/dto';

import { UserStatus } from '@common/enums';

export class MatchUserResponseDTO {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  uid: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiProperty({ enum: UserStatus })
  status: UserStatus;

  @Expose()
  @ApiProperty()
  coins: number;

  @Expose()
  @ApiProperty()
  premiumCoins: number;

  @Expose()
  @ApiProperty()
  subscription: boolean;

  @Expose()
  @ApiProperty()
  level: number;

  @Expose()
  @ApiProperty()
  points: number;

  @Expose()
  @ApiProperty()
  tickets: number;

  @Expose()
  @Type(() => StatisticsResponseDTO)
  @ApiProperty()
  statistics: StatisticsResponseDTO;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;

  @Expose()
  @ApiProperty()
  avatar?: string;

  @Exclude()
  @ApiHideProperty()
  categories: CategoryResponseDTO;
}
