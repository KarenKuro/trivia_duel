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
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { FileService } from '@shared/file/file.service';

import { IdDTO, PaginationQueryDTO, SuccessDTO } from '@common/dtos';
import { Folder, TokenTypes } from '@common/enums';
import { AuthUserGuard } from '@common/guards';
import { ResponseManager } from '@common/helpers';
import { ERROR_MESSAGES } from '@common/messages';
import { IMedia } from '@common/models/media';

import { CategoriesService } from './categories.service';
import {
  CategoryResponseDTO,
  CreateCategoryDTO,
  UpdateCategoryDTO,
} from './dto';

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
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({
    status: 201,
    type: SuccessDTO,
  })
  async create(
    @Body() body: CreateCategoryDTO,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /.(jpg|jpeg|png|xml)$/,
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
  ): Promise<SuccessDTO> {
    const existCategory = await this._categoriesService.findOne({
      text: body.text,
    });

    if (existCategory) {
      throw ResponseManager.buildError(ERROR_MESSAGES.CATEGORY_ALREADY_EXIST);
    }

    const filePath = await this._fileService.saveFile(file, Folder.CATEGORIES);

    await this._categoriesService.create({ ...body, path: filePath });
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
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update a category by id' })
  async update(
    @Param() param: IdDTO,
    @Body() body: UpdateCategoryDTO,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /.(jpg|jpeg|png|svg|xml)$/,
        })
        .addMaxSizeValidator({
          maxSize: 5 * 1000 * 1000,
        })
        .build({
          errorHttpStatusCode: HttpStatus.BAD_REQUEST,
          fileIsRequired: false,
        }),
    )
    file: Express.Multer.File,
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

    let updatedPath: string = null;

    const previousFilePath = (category.image as IMedia).path;

    if (file) {
      await this._fileService.removeFile(previousFilePath);
      updatedPath = await this._fileService.saveFile(file, Folder.CATEGORIES);
    }

    return await this._categoriesService.update(category, {
      ...body,
      path: updatedPath,
    });
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
}
