import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

import { Exclude, Expose } from 'class-transformer';

import { CategoryResponseDTO } from '@api-resources/categories/dto';

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
  @ApiProperty()
  longestWinCount: number;

  @Expose()
  @ApiProperty()
  currentWinCount: number;

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
