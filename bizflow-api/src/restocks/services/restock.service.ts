import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { BaseService } from '../../common/services/base.service';
import { InventoryRepository } from '../../inventory/repositories/inventory.repository';
import { InventoryService } from '../../inventory/services/inventory.service';
import { CreateRestockRequestDto, UpdateRestockRequestDto, ApproveRestockRequestDto, RestockRequestStatus } from '../dto/restock.dto';
import { RestockRepository } from '../repositories/restock.repository';
import { RestockRequestDocument } from '../schemas/restock.schema';

@Injectable()
export class RestockService extends BaseService<RestockRequestDocument> {
  constructor(
    private readonly restockRepository: RestockRepository,
    private readonly inventoryRepository: InventoryRepository,
    private readonly inventoryService: InventoryService,
  ) {
    super(restockRepository);
  }

  private toObjectId(value?: string | null): Types.ObjectId | null {
    return value && Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : null;
  }

  async createRestockRequest(
    createDto: CreateRestockRequestDto,
    userId?: string,
    organizationId?: string,
    branchId?: string | null,
  ) {
    const orgId = createDto.organizationId || organizationId;
    if (!orgId || !Types.ObjectId.isValid(orgId)) {
      throw new BadRequestException('organizationId is required and must be a valid ObjectId');
    }

    const normalizedLineItems = await this.resolveLineItems(createDto.lineItems, orgId, branchId || createDto.branchId || null);

    const payload = {
      ...createDto,
      organizationId: new Types.ObjectId(orgId),
      branchId: this.toObjectId(createDto.branchId) || this.toObjectId(branchId),
      requestedBy: userId ? new Types.ObjectId(userId) : undefined,
      status: createDto.status || RestockRequestStatus.DRAFT,
      lineItems: normalizedLineItems,
    } as any;

    delete payload._id;

    return this.repository.create(payload, userId);
  }

  async updateRestockRequest(id: string, updateDto: UpdateRestockRequestDto, userId?: string, organizationId?: string, branchId?: string | null) {
    const current = await this.repository.findById(id);
    if (!current) {
      throw new BadRequestException('Restock request not found');
    }

    if (current.status !== RestockRequestStatus.DRAFT && current.status !== RestockRequestStatus.PENDING) {
      throw new BadRequestException('Only draft or pending restock requests can be updated');
    }

    const normalizedLineItems = updateDto.lineItems
      ? await this.resolveLineItems(updateDto.lineItems, organizationId || current.organizationId.toString(), branchId || current.branchId?.toString() || null)
      : undefined;

    const payload: any = { ...updateDto };
    if (normalizedLineItems) {
      payload.lineItems = normalizedLineItems;
    }

    return this.repository.updateById(id, payload, userId);
  }

  async submitRestockRequest(id: string, userId?: string) {
    return this.repository.updateById(id, { status: RestockRequestStatus.PENDING } as any, userId);
  }

  async approveRestockRequest(id: string, approveDto: ApproveRestockRequestDto, userId?: string) {
    const current = await this.repository.findById(id);
    if (!current) {
      throw new BadRequestException('Restock request not found');
    }

    if (current.status === RestockRequestStatus.APPROVED) {
      throw new ConflictException('Restock request is already approved');
    }

    const lineItems = approveDto.lineItems?.length
      ? await this.resolveLineItems(approveDto.lineItems, current.organizationId.toString(), current.branchId?.toString() || null)
      : current.lineItems.map((item: any) => ({
          ...item,
          approvedQuantity: item.approvedQuantity ?? item.requestedQuantity,
        }));

    for (const lineItem of lineItems) {
      const approvedQuantity = Number(lineItem.approvedQuantity ?? lineItem.requestedQuantity);
      if (approvedQuantity <= 0) {
        throw new BadRequestException('Approved quantity must be greater than zero');
      }

      await this.inventoryService.increaseQuantity(
        lineItem.inventoryId.toString(),
        approvedQuantity,
        userId,
      );
    }

    return this.repository.updateById(
      id,
      {
        status: RestockRequestStatus.APPROVED,
        approvedBy: userId ? new Types.ObjectId(userId) : undefined,
        approvedAt: new Date(),
        approvalNotes: approveDto.approvalNotes || null,
        lineItems,
      } as any,
      userId,
    );
  }

  async rejectRestockRequest(id: string, approvalNotes: string | undefined, userId?: string) {
    return this.repository.updateById(
      id,
      {
        status: RestockRequestStatus.REJECTED,
        approvedBy: userId ? new Types.ObjectId(userId) : undefined,
        approvedAt: new Date(),
        approvalNotes: approvalNotes || null,
      } as any,
      userId,
    );
  }

  async getRestocksByOrganization(organizationId: string, branchId?: string | null, page: number = 1, limit: number = 10) {
    return this.restockRepository.findByOrganization(organizationId, branchId, page, limit);
  }

  async getRestockStats(organizationId: string, branchId?: string | null) {
    return this.restockRepository.getOrganizationStats(organizationId, branchId);
  }

  private async resolveLineItems(lineItems: any[], organizationId: string, branchId?: string | null) {
    const resolved = [] as any[];

    for (const lineItem of lineItems) {
      const inventory = await this.inventoryRepository.findById(lineItem.inventoryId);
      if (!inventory) {
        throw new BadRequestException(`Inventory item ${lineItem.inventoryId} not found`);
      }

      if (inventory.organizationId.toString() !== organizationId) {
        throw new BadRequestException(`Inventory item ${inventory.sku} does not belong to the active organization`);
      }

      if (branchId && inventory.branchId && inventory.branchId.toString() !== branchId) {
        throw new BadRequestException(`Inventory item ${inventory.sku} does not belong to the active branch`);
      }

      resolved.push({
        inventoryId: new Types.ObjectId(inventory._id.toString()),
        sku: inventory.sku,
        name: inventory.name,
        requestedQuantity: Number(lineItem.requestedQuantity),
        approvedQuantity: lineItem.approvedQuantity !== undefined ? Number(lineItem.approvedQuantity) : Number(lineItem.requestedQuantity),
        unitCost: lineItem.unitCost !== undefined ? Number(lineItem.unitCost) : Number(inventory.costPrice || 0),
        notes: lineItem.notes || null,
      });
    }

    return resolved;
  }
}
