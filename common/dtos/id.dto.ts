import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsNumberString } from 'class-validator';

import { IId } from '@common/models';

export class IdDTO implements IId {
  @ApiProperty()
  @IsNumberString()
  @IsNotEmpty()
  id: string;
}
