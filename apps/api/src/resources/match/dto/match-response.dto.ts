import { ApiProperty } from '@nestjs/swagger';

import { Expose, Type } from 'class-transformer';

import { QuestionResponseDTO } from '@common/dtos';
import { MatchUserResponseDTO } from '@common/dtos/match-response/match-user-response.dto';
import { NextOrPreviousMatchResponseDTO } from '@common/dtos/match-response/next-match.response.dto';
import { MatchLevel, MatchStatusType } from '@common/enums';

import { MatchCategoryDTO } from './match-category.dto';
import { UserAnswerResponseDTO } from './user-answer-response.dto';

export class MatchResponseDTO {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  status: MatchStatusType;

  @Expose()
  @Type(() => MatchUserResponseDTO)
  @ApiProperty({ type: MatchUserResponseDTO, isArray: true })
  users: MatchUserResponseDTO[];

  // @Expose()
  @ApiProperty()
  questions: QuestionResponseDTO[];

  // @ApiProperty({ type: UserAnswerResponseDTO })
  // lastAnswer: UserAnswerResponseDTO;

  @Expose()
  @Type(() => MatchUserResponseDTO)
  @ApiProperty({ type: MatchUserResponseDTO, nullable: true })
  winner: MatchUserResponseDTO;

  @Expose()
  @Type(() => MatchUserResponseDTO)
  @ApiProperty({ type: MatchUserResponseDTO, nullable: true })
  looser: MatchUserResponseDTO;

  @Expose()
  @ApiProperty()
  matchLevel: MatchLevel;

  @Expose()
  @Type(() => MatchCategoryDTO)
  @ApiProperty({ type: MatchCategoryDTO, isArray: true, nullable: true })
  categories: MatchCategoryDTO[];

  @Expose()
  @Type(() => UserAnswerResponseDTO)
  @ApiProperty({ nullable: true })
  userAsnwers: UserAnswerResponseDTO[];

  @Expose()
  @Type(() => NextOrPreviousMatchResponseDTO)
  @ApiProperty({ type: NextOrPreviousMatchResponseDTO, nullable: true })
  previousMatch: NextOrPreviousMatchResponseDTO;

  @Expose()
  @Type(() => NextOrPreviousMatchResponseDTO)
  @ApiProperty({ type: NextOrPreviousMatchResponseDTO, nullable: true })
  nextMatch: NextOrPreviousMatchResponseDTO;

  @Expose()
  @ApiProperty()
  againstBot: boolean;

  @Expose()
  @ApiProperty()
  startedAt: Date;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}
