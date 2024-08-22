import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
  Patch,
  Delete,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  ParseFilePipeBuilder,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { IdDTO, PaginationQueryDTO, PathDTO, SuccessDTO } from '@common/dtos';
import { TokenTypes } from '@common/enums';
import { AuthUserGuard } from '@common/guards';
import { ResponseManager } from '@common/helpers';
import { ERROR_MESSAGES } from '@common/messages';

import { CategoriesService } from './categories.service';
import {
  CategoryResponseDTO,
  CreateCategoryDTO,
  UpdateCategoryDTO,
} from './dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from '@shared/file/file.service';

@Controller('categories')
@UseGuards(AuthUserGuard(TokenTypes.PRIMARY))
@ApiTags('Categories')
@ApiBearerAuth()
export class CategoriesController {
  constructor(
    private readonly _categoriesService: CategoriesService,
    private readonly _fileService: FileService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({
    status: 201,
    type: SuccessDTO,
  })
  async create(@Body() body: CreateCategoryDTO): Promise<SuccessDTO> {
    const existCategory = await this._categoriesService.findOne({
      text: body.text,
    });

    if (existCategory) {
      throw ResponseManager.buildError(ERROR_MESSAGES.CATEGORY_ALREADY_EXIST);
    }

    await this._categoriesService.create(body);
    return { success: true };
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
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
  ): Promise<CategoryResponseDTO[]> {
    const categories = await this._categoriesService.findAll(pagination);

    if (!categories.length) {
      throw ResponseManager.buildError(ERROR_MESSAGES.CATEGORIES_NOT_EXISTS);
    }
    return categories;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a category by id' })
  async findOne(@Param() param: IdDTO): Promise<CategoryResponseDTO> {
    const category = await this._categoriesService.findOne({ id: +param.id });

    if (!category) {
      throw ResponseManager.buildError(ERROR_MESSAGES.CATEGORY_NOT_EXIST);
    }

    return category;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category by id' })
  async update(
    @Param() param: IdDTO,
    @Body() body: UpdateCategoryDTO,
  ): Promise<SuccessDTO> {
    const category = await this._categoriesService.findOne({ id: +param.id });

    if (!category) {
      throw ResponseManager.buildError(ERROR_MESSAGES.CATEGORY_NOT_EXIST);
    }

    if (body.text) {
      const existCategory = await this._categoriesService.findOne({
        text: body.text,
      });
      if (existCategory && existCategory.id !== category.id) {
        throw ResponseManager.buildError(ERROR_MESSAGES.CATEGORY_ALREADY_EXIST);
      }
    }

    return await this._categoriesService.update(category, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category by id' })
  async remove(@Param() param: IdDTO): Promise<SuccessDTO> {
    const category = await this._categoriesService.findOne({ id: +param.id });

    if (!category) {
      throw ResponseManager.buildError(ERROR_MESSAGES.CATEGORY_NOT_EXIST);
    }
    return await this._categoriesService.remove(category);
  }

  @UseInterceptors(FileInterceptor('image'))
  @Post('image')
  @ApiOperation({ summary: 'Upload category image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'The file and additional data to upload' })
  @ApiResponse({
    status: 201,
    description: 'File successfully uploaded.',
    type: PathDTO,
  })
  async uploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /.(jpg|jpeg|png)$/,
        })
        .addMaxSizeValidator({
          maxSize: 5 * 1000 * 1000,
        })
        .build({
          errorHttpStatusCode: HttpStatus.BAD_REQUEST,
          fileIsRequired: true,
        }),
    )
    file: Express.Multer.File,
  ): Promise<PathDTO> {
    const savedFilePath = await this._fileService.saveFile(file);
    return { path: savedFilePath };
  }
}
