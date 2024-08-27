import { ApiProperty } from '@nestjs/swagger';

import { IsBoolean } from 'class-validator';

import { MediaResponseDTO } from './media.response.dto';

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

  @ApiProperty({ type: String })
  image?: MediaResponseDTO | string;
}
