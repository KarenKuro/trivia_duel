import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { IdDTO, PaginationQueryDTO, SuccessDTO } from '@common/dtos';
import { ResponseManager } from '@common/helpers';
import { ERROR_MESSAGES } from '@common/messages';
import {
  AllUsersResponseDTO,
  UpdateUserStatusDTO,
  UserResponseDTO,
} from './dto';
import { AuthUserGuard } from '@common/guards';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@Controller('users')
@UseGuards(AuthUserGuard())
@ApiTags('Users')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly _userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Number of records to skip',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of records to return',
  })
  async findAll(
    @Query() pagination: PaginationQueryDTO,
  ): Promise<AllUsersResponseDTO> {
    const [users, count] = await this._userService.findAll(pagination);

    const { offset, limit } = pagination;

    const meta = ResponseManager.generateMetaResponse(
      Number(offset),
      Number(limit),
      count,
    );
    return { users: users, meta };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id' })
  async findOne(@Param() param: IdDTO): Promise<UserResponseDTO> {
    const user = await this._userService.findOne({ id: +param.id });

    if (!user) {
      throw ResponseManager.buildError(ERROR_MESSAGES.USER_NOT_EXISTS);
    }

    return user;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user status by id' })
  async update(
    @Param() param: IdDTO,
    @Body() body: UpdateUserStatusDTO,
  ): Promise<SuccessDTO> {
    const user = await this._userService.findOne({ id: +param.id });

    if (!user) {
      throw ResponseManager.buildError(ERROR_MESSAGES.USER_NOT_EXISTS);
    }

    if (body.status === user.status) {
      return { success: true };
    }

    return await this._userService.update(user, body);
  }
}
