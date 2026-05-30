import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { BaseService } from '../../common/services/base.service';
import { CreateInventoryDto, UpdateInventoryDto } from '../dto/inventory.dto';
import { InventoryRepository } from '../repositories/inventory.repository';
import { InventoryDocument } from '../schemas/inventory.schema';

@Injectable()
export class InventoryService extends BaseService<InventoryDocument> {
  constructor(private readonly inventoryRepository: InventoryRepository) {
    super(inventoryRepository);
  }

  async createInventory(createDto: CreateInventoryDto, userId?: string, organizationId?: string) {
    const orgId = createDto.organizationId || organizationId;
    if (!orgId) {
      throw new BadRequestException('organizationId is required');
    }

    const existing = await this.inventoryRepository.findBySku(createDto.sku, orgId);
    if (existing) {
      throw new ConflictException('Inventory SKU already exists in this organization');
    }

    const inventoryData = {
      ...createDto,
      sku: createDto.sku.toUpperCase(),
      organizationId: new Types.ObjectId(orgId),
    };

    if ((inventoryData as any)._id !== undefined) {
      delete (inventoryData as any)._id;
    }

    return this.repository.create(inventoryData, userId);
  }

  async updateInventory(inventoryId: string, updateDto: UpdateInventoryDto, currentUserId?: string) {
    if (updateDto.sku) {
      const current = await this.repository.findById(inventoryId);
      if (!current) {
        throw new BadRequestException('Inventory item not found');
      }

      const existing = await this.inventoryRepository.findBySku(updateDto.sku, current.organizationId.toString());
      if (existing && existing._id.toString() !== inventoryId) {
        throw new ConflictException('Inventory SKU already exists in this organization');
      }

      updateDto.sku = updateDto.sku.toUpperCase();
    }

    return this.repository.updateById(inventoryId, updateDto, currentUserId);
  }

  async getInventoryByOrganization(organizationId: string, page: number = 1, limit: number = 10) {
    return this.inventoryRepository.findByOrganization(organizationId, page, limit);
  }

  async getOrganizationStats(organizationId: string) {
    return this.inventoryRepository.getOrganizationStats(organizationId);
  }

  async softDelete(inventoryId: string, currentUserId?: string) {
    return this.delete(inventoryId, currentUserId);
  }
}
