import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';

import { MatchUserResponseDTO } from '@common/dtos';
import { MatchLevel, MatchStatusType } from '@common/enums';

import { LastAnswerInSocketDTO } from './last-answer-in-socket.dto';
import { NextMatchDataToSendDTO } from './next-match-data-to-send.dto';

export class MatchDataToSendInSocketDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  status: MatchStatusType;

  @Type(() => MatchUserResponseDTO)
  @ApiProperty({ type: MatchUserResponseDTO, nullable: true })
  winner?: Omit<MatchUserResponseDTO, 'categories'>;

  @ApiProperty()
  matchLevel: MatchLevel;

  @Type(() => LastAnswerInSocketDTO)
  @ApiProperty({ type: LastAnswerInSocketDTO, nullable: true })
  lastAnswer?: LastAnswerInSocketDTO;

  @ApiProperty({ type: NextMatchDataToSendDTO, nullable: true })
  nextMatch?: NextMatchDataToSendDTO;

  @ApiProperty()
  againstBot: boolean;

  @ApiProperty()
  startedAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
