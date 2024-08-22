import { ApiProperty } from '@nestjs/swagger';

export class PathDTO {
  @ApiProperty()
  path: string;
}
