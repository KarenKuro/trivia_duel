import { ApiProperty } from '@nestjs/swagger';

import { IsBoolean } from 'class-validator';

export class CategoryWithIsActiveDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  text: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  premiumPrice: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  @IsBoolean()
  isActive?: boolean;
}
