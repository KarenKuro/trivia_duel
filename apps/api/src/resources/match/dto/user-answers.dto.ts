import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

import { UserAnswerDTO } from './user-answer.dto';

export class UserAnswersDTO {
  @IsNotEmpty()
  @Type(() => UserAnswerDTO)
  @ApiProperty({ type: UserAnswerDTO, isArray: true, nullable: false })
  userAnswers: UserAnswerDTO[];
}
