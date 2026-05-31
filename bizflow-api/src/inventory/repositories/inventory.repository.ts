import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseRepository } from '../../common/repositories/base.repository';
import { DocumentStatus } from '../../common/schemas/base.schema';
import { Inventory, InventoryDocument } from '../schemas/inventory.schema';

@Injectable()
export class InventoryRepository extends BaseRepository<InventoryDocument> {
  constructor(@InjectModel(Inventory.name) private readonly inventoryModel: Model<InventoryDocument>) {
    super(inventoryModel);
  }

  async findBySku(sku: string, organizationId: string): Promise<InventoryDocument | null> {
    return this.model
      .findOne({
        sku: sku.toUpperCase(),
        organizationId: new Types.ObjectId(organizationId),
        isDeleted: false,
      })
      .lean()
      .exec();
  }

  async findByOrganization(
    organizationId: string,
    branchId?: string | null,
    page: number = 1,
    limit: number = 10,
  ) {
    const filter: any = { organizationId };
    if (branchId) {
      filter.branchId = branchId;
    }

    return this.findAllPaginated(
      {
        ...filter,
        organizationId: new Types.ObjectId(organizationId),
        ...(branchId ? { branchId: new Types.ObjectId(branchId) } : {}),
      },
      page,
      limit,
    );
  }

  async findLowStock(organizationId: string, branchId?: string | null) {
    const filter: any = {
      organizationId: new Types.ObjectId(organizationId),
      isDeleted: false,
      $expr: { $lte: ['$quantity', '$reorderLevel'] },
    };

    if (branchId) {
      filter.branchId = new Types.ObjectId(branchId);
    }

    return this.find(filter as any);
  }

  async getOrganizationStats(organizationId: string, branchId?: string | null) {
    const match: any = {
      organizationId: new Types.ObjectId(organizationId),
      isDeleted: false,
    };

    if (branchId) {
      match.branchId = new Types.ObjectId(branchId);
    }

    const [totals] = await this.aggregate([
      {
        $match: match,
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ['$status', DocumentStatus.ACTIVE] }, 1, 0] },
          },
          lowStock: {
            $sum: { $cond: [{ $lte: ['$quantity', '$reorderLevel'] }, 1, 0] },
          },
          outOfStock: {
            $sum: { $cond: [{ $lte: ['$quantity', 0] }, 1, 0] },
          },
        },
      },
    ]);

    return {
      total: totals?.total || 0,
      active: totals?.active || 0,
      lowStock: totals?.lowStock || 0,
      outOfStock: totals?.outOfStock || 0,
    };
  }
}
