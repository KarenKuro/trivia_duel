import { ApiProperty } from '@nestjs/swagger';

import { Expose, Type } from 'class-transformer';

import { CategoryResponseWithoutTranslationsDTO } from '@common/dtos';
import { UserStatus } from '@common/enums';
import { IUser } from '@common/models';

import { StatisticsResponseDTO } from './statistics-response.dto';

export class UserResponseDTO implements IUser {
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
  @ApiProperty()
  status: UserStatus;

  @Expose()
  @Type(() => CategoryResponseWithoutTranslationsDTO)
  @ApiProperty()
  categories: CategoryResponseWithoutTranslationsDTO[];

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
}
