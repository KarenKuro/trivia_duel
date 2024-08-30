import { ApiProperty } from '@nestjs/swagger';

import { QuestionType } from '@common/enums';

export class QuestionInSocketDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  text: string;

  @ApiProperty()
  type: QuestionType;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
