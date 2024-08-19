import { UserEntity } from '@common/database/entities';
import { IMessageSuccess, IPagination, IUser } from '@common/models';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly _userRepository: Repository<UserEntity>,
  ) {}

  async findAll(pagination: IPagination): Promise<[IUser[], number]> {
    const { offset, limit } = pagination;
    const [users, count] = await this._userRepository.findAndCount({
      relations: ['categories'],
      skip: +offset,
      take: +limit,
    });

    return [users, count];
  }

  async findOne(param: Partial<IUser>): Promise<IUser> {
    const user = this._userRepository.findOne({
      where: param,
      relations: ['categories'],
    });

    return user;
  }

  @Transactional()
  async update(user: IUser, body: Partial<IUser>): Promise<IMessageSuccess> {
    await this._userRepository.update(user.id, body);

    return { success: true };
  }
}
