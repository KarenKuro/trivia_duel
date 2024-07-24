import { Controller } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // @Post()
  // create(@Body() body) {
  //   return this.categoriesService.create(body);
  // }

  // @Get()
  // @UseGuards(AuthUserGuard())
  // findAll(@AuthUser() user: ITokenPayload) {
  //   console.log(user);

  //   return this.categoriesService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.categoriesService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() body) {
  //   return this.categoriesService.update(+id, body);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.categoriesService.remove(+id);
  // }
}
