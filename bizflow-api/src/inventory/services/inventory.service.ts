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
      branchId: createDto.branchId ? new Types.ObjectId(createDto.branchId) : null,
    };

    if ((inventoryData as any)._id !== undefined) {
      delete (inventoryData as any)._id;
    }

    return this.repository.create(inventoryData, userId);
  }

  async updateInventory(inventoryId: string, updateDto: UpdateInventoryDto, currentUserId?: string) {
    const updateData: any = { ...updateDto };

    if (updateData.sku) {
      const current = await this.repository.findById(inventoryId);
      if (!current) {
        throw new BadRequestException('Inventory item not found');
      }

      const existing = await this.inventoryRepository.findBySku(updateData.sku, current.organizationId.toString());
      if (existing && existing._id.toString() !== inventoryId) {
        throw new ConflictException('Inventory SKU already exists in this organization');
      }

      updateData.sku = updateData.sku.toUpperCase();
    }

    if (updateData.branchId !== undefined) {
      updateData.branchId = updateData.branchId ? new Types.ObjectId(updateData.branchId) : null;
    }

    return this.repository.updateById(inventoryId, updateData, currentUserId);
  }

  async getInventoryByOrganization(
    organizationId: string,
    branchId?: string | null,
    page: number = 1,
    limit: number = 10,
  ) {
    return this.inventoryRepository.findByOrganization(organizationId, branchId, page, limit);
  }

  async getOrganizationStats(organizationId: string, branchId?: string | null) {
    return this.inventoryRepository.getOrganizationStats(organizationId, branchId);
  }

  async increaseQuantity(inventoryId: string, amount: number, currentUserId?: string) {
    const current = await this.repository.findById(inventoryId);
    if (!current) {
      throw new BadRequestException('Inventory item not found');
    }

    const nextQuantity = Number(current.quantity || 0) + Number(amount || 0);
    if (nextQuantity < 0) {
      throw new BadRequestException('Inventory quantity cannot become negative');
    }

    const inventoryObjectId = new Types.ObjectId(inventoryId);
    const updateResult = await this.inventoryRepository.getModel().updateOne(
      { _id: inventoryObjectId },
      {
        $set: {
          quantity: nextQuantity,
          lastStockedAt: new Date(),
          updatedBy: currentUserId ? new Types.ObjectId(currentUserId) : undefined,
          updatedAt: new Date(),
        },
      },
    );

    if (!updateResult.matchedCount) {
      throw new BadRequestException('Inventory item not found');
    }

    const updatedInventory = await this.repository.findById(inventoryId);
    if (!updatedInventory) {
      throw new BadRequestException('Inventory item not found');
    }

    return updatedInventory;
  }

  async decreaseQuantity(inventoryId: string, amount: number, currentUserId?: string) {
    if (Number(amount || 0) <= 0) {
      throw new BadRequestException('Decrease amount must be greater than zero');
    }

    const current = await this.repository.findById(inventoryId);
    if (!current) {
      throw new BadRequestException('Inventory item not found');
    }

    const nextQuantity = Number(current.quantity || 0) - Number(amount || 0);
    if (nextQuantity < 0) {
      throw new BadRequestException('Insufficient inventory quantity for this sale');
    }

    const inventoryObjectId = new Types.ObjectId(inventoryId);
    const updateResult = await this.inventoryRepository.getModel().updateOne(
      { _id: inventoryObjectId },
      {
        $set: {
          quantity: nextQuantity,
          updatedBy: currentUserId ? new Types.ObjectId(currentUserId) : undefined,
          updatedAt: new Date(),
        },
      },
    );

    if (!updateResult.matchedCount) {
      throw new BadRequestException('Inventory item not found');
    }

    const updatedInventory = await this.repository.findById(inventoryId);
    if (!updatedInventory) {
      throw new BadRequestException('Inventory item not found');
    }

    return updatedInventory;
  }

  async softDelete(inventoryId: string, currentUserId?: string) {
    return this.delete(inventoryId, currentUserId);
  }
}
