import { IId } from '@common/models';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString } from 'class-validator';

export class IdDTO implements IId {
  @ApiProperty()
  @IsNumberString()
  @IsNotEmpty()
  id: string;
}
