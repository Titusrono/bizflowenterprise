import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto/category.dto';
import { CategoriesService } from '../services/categories.service';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCategoryDto: CreateCategoryDto, @Req() req: any) {
    return this.categoriesService.createCategory(
      createCategoryDto,
      req.user?.userId,
      req.user?.organizationId,
    );
  }

  @Get()
  async findAll(@Req() req: any, @Query('search') search?: string) {
    return this.categoriesService.getCategoriesByOrganization(req.user?.organizationId, search);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.categoriesService.getById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto, @Req() req: any) {
    return this.categoriesService.updateCategory(id, updateCategoryDto, req.user?.userId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: any) {
    return this.categoriesService.softDelete(id, req.user?.userId);
  }
}