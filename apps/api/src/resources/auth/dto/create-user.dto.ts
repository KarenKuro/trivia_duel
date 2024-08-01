// Only for mobile developers. Comment this method in producnion mode
// Only for mobile developers. Comment this method in producnion mode
// Only for mobile developers. Comment this method in producnion mode
// Only for mobile developers. Comment this method in producnion mode
// Only for mobile developers. Comment this method in producnion mode

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  uid: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  email?: string;
}
