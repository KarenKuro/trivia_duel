import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class AmountDTO {
  @ApiProperty()
  @IsNumber()
  amount: number;
}
