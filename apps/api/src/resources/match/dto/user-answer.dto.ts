import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UserAnswerDTO {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  questionId: number;

  @IsNumber()
  @IsOptional()
  answerId?: number;

  @IsString()
  @IsOptional()
  answer?: string;
}
