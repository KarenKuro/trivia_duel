import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class TranslatedCategoryDTO {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  languageId: number;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => {
    return value?.trim();
  })
  @ApiProperty()
  text: string;
}
