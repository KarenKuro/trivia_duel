import { ApiProperty } from '@nestjs/swagger';

import { IsBoolean } from 'class-validator';

import { IMessageSuccess } from '@common/models';

export class SuccessDTO implements IMessageSuccess {
  @ApiProperty({ type: Boolean })
  @IsBoolean()
  success: boolean;
}
