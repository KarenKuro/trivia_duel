import { UserStatus } from '@common/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateUserStatusDTO {
  @IsEnum(UserStatus)
  @IsNotEmpty()
  @ApiProperty()
  status: UserStatus;
}
