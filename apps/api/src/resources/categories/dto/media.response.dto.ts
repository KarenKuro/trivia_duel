import { ApiProperty } from '@nestjs/swagger';

export class MediaResponseDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  path: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
