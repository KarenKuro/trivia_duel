import { IUpdateTranslatedCategory } from '@common/models';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateTranslatedCategoryDTO implements IUpdateTranslatedCategory {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  id: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  text: string;
}
