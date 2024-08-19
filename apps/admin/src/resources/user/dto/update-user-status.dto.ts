import { ApiProperty } from '@nestjs/swagger';

import { IsEnum, IsNotEmpty } from 'class-validator';

import { UserStatus } from '@common/enums';

export class UpdateUserStatusDTO {
  @IsEnum(UserStatus)
  @IsNotEmpty()
  @ApiProperty()
  status: UserStatus;
}
