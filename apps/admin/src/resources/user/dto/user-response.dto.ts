import { CategoryResponseDTO } from '@admin-resources/categories/dto';
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
  lives: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
