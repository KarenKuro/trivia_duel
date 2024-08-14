import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class TranslatedCategoryDTO {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  languageId: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  translatedName: string;
}
