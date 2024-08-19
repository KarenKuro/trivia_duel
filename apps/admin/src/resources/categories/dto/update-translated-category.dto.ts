import { ApiProperty } from '@nestjs/swagger';

import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

import { IUpdateTranslatedCategory } from '@common/models';

export class UpdateTranslatedCategoryDTO implements IUpdateTranslatedCategory {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  id: number;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => {
    return value?.trim();
  })
  @ApiProperty()
  text: string;
}