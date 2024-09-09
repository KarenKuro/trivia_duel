import { ApiProperty } from '@nestjs/swagger';

import { MetaResponseDTO } from '@common/dtos';

import { QuestionResponseDTO } from './question-response.dto';

export class AllQuestionsResponseDTO {
  @ApiProperty()
  questions: QuestionResponseDTO[];
  @ApiProperty()
  meta: MetaResponseDTO;
}
