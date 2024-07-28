import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class TokenPayloadDTO {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsNumber()
  iat: number;

  @ApiProperty()
  @IsNumber()
  exp: number;
}
