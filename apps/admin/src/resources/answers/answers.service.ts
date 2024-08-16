import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AnswerEntity } from '@common/database/entities';
import { IAnswer, IMessageSuccess } from '@common/models';

@Injectable()
export class AnswersService {
  constructor(
    @InjectRepository(AnswerEntity)
    private readonly _answerRepository: Repository<AnswerEntity>,
  ) {}

  async create(answer: Partial<IAnswer>): Promise<IAnswer> {
    return this._answerRepository.save(answer);
  }

  async remove(answer: IAnswer): Promise<IMessageSuccess> {
    await this._answerRepository.delete(answer.id);

    return { success: true };
  }

  async findOne(param: number): Promise<AnswerEntity> {
    const answer = await this._answerRepository.findOne({
      where: { id: param },
      relations: ['question', 'translatedAnswers'],
    });
    return answer;
  }

  async update(
    answer: IAnswer,
    body: Partial<IAnswer>,
  ): Promise<IMessageSuccess> {
    await this._answerRepository.update(answer.id, body);

    return { success: true };
  }
}
