import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

import { IAdminLogin } from '@common/models';

export class LoginDTO implements IAdminLogin {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  adminName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}
