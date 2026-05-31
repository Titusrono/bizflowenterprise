import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { BaseService } from '../../common/services/base.service';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto/category.dto';
import { CategoriesRepository } from '../repositories/categories.repository';
import { CategoryDocument } from '../schemas/category.schema';

@Injectable()
export class CategoriesService extends BaseService<CategoryDocument> {
  constructor(private readonly categoriesRepository: CategoriesRepository) {
    super(categoriesRepository);
  }

  async createCategory(createDto: CreateCategoryDto, userId?: string, organizationId?: string) {
    const orgId = organizationId;
    const name = createDto.name?.trim();

    if (!orgId) {
      throw new BadRequestException('organizationId is required');
    }

    if (!name) {
      throw new BadRequestException('Category name is required');
    }

    const existing = await this.categoriesRepository.findByName(name, orgId);
    if (existing) {
      throw new ConflictException('Category name already exists in this organization');
    }

    const categoryData = {
      name,
      description: createDto.description?.trim() || null,
      organizationId: new Types.ObjectId(orgId),
    };

    return this.create(categoryData as any, userId);
  }

  async updateCategory(categoryId: string, updateDto: UpdateCategoryDto, currentUserId?: string) {
    const existing = await this.repository.findById(categoryId);
    if (!existing) {
      throw new BadRequestException('Category not found');
    }

    const updateData: Record<string, any> = { ...updateDto };
    if (updateData.name) {
      const nextName = updateData.name.trim();
      const duplicate = await this.categoriesRepository.findByName(nextName, existing.organizationId.toString());
      if (duplicate && duplicate._id.toString() !== categoryId) {
        throw new ConflictException('Category name already exists in this organization');
      }

      updateData.name = nextName;
    }

    if (updateData.description !== undefined) {
      updateData.description = updateData.description?.trim() || null;
    }

    return this.repository.updateById(categoryId, updateData, currentUserId);
  }

  async getCategoriesByOrganization(organizationId: string, search?: string) {
    if (!organizationId) {
      throw new BadRequestException('organizationId is required');
    }

    return this.categoriesRepository.findByOrganization(organizationId, search);
  }

  async softDelete(categoryId: string, currentUserId?: string) {
    return this.delete(categoryId, currentUserId);
  }
}