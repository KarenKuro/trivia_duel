import { ApiPropertyOptional } from '@nestjs/swagger';

import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateUserDTO {
  @IsString()
  @Transform(({ value }) => {
    return value?.trim();
  })
  @IsOptional()
  @ApiPropertyOptional()
  name: string;

  @IsNumber()
  @Transform(({ value }) => {
    return !isNaN(value) ? Number(value) : value;
  })
  @IsOptional()
  @ApiPropertyOptional()
  tickets: number;

  @IsString()
  @Transform(({ value }) => {
    return value?.trim();
  })
  @IsOptional()
  @ApiPropertyOptional()
  avatar: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => {
    return !isNaN(value) ? Number(value) : value;
  })
  @ApiPropertyOptional()
  coins: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => {
    return !isNaN(value) ? Number(value) : value;
  })
  @ApiPropertyOptional()
  premiumCoins: number;
}
