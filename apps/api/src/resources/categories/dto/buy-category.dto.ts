import { ApiProperty } from '@nestjs/swagger';

import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';

import { CurrencyTypes } from '@common/enums';

export class BuyCategoryDTO {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsEnum(CurrencyTypes)
  @IsNotEmpty()
  @ApiProperty()
  currencyType: CurrencyTypes;
}
