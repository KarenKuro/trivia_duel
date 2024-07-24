import { PartialType } from '@nestjs/swagger';
import { CreateCategoryDTO } from './create-category.dto';
import { ICreateCategory } from '@common/models';

export class UpdateCategoryDTO
  extends PartialType(CreateCategoryDTO)
  implements Partial<ICreateCategory> {}
