import { CurrencyTypes } from '@common/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';

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
