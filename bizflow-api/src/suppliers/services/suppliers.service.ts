import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { BaseService } from '../../common/services/base.service';
import { CreateSupplierDto, UpdateSupplierDto } from '../dto/supplier.dto';
import { SuppliersRepository } from '../repositories/suppliers.repository';
import { SupplierDocument } from '../schemas/supplier.schema';

@Injectable()
export class SuppliersService extends BaseService<SupplierDocument> {
  constructor(private readonly suppliersRepository: SuppliersRepository) {
    super(suppliersRepository);
  }

  async createSupplier(createDto: CreateSupplierDto, userId?: string, organizationId?: string) {
    const orgId = organizationId;
    const name = createDto.name?.trim();

    if (!orgId) {
      throw new BadRequestException('organizationId is required');
    }

    if (!name) {
      throw new BadRequestException('Supplier name is required');
    }

    const existing = await this.suppliersRepository.findByName(name, orgId);
    if (existing) {
      throw new ConflictException('Supplier name already exists in this organization');
    }

    const supplierData = {
      name,
      phoneNumber: createDto.phoneNumber?.trim() || null,
      email: createDto.email?.trim() || null,
      organizationId: new Types.ObjectId(orgId),
    };

    return this.create(supplierData as any, userId);
  }

  async updateSupplier(supplierId: string, updateDto: UpdateSupplierDto, currentUserId?: string) {
    const existing = await this.repository.findById(supplierId);
    if (!existing) {
      throw new BadRequestException('Supplier not found');
    }

    const updateData: Record<string, any> = { ...updateDto };
    if (updateData.name !== undefined) {
      const nextName = updateData.name?.trim();
      if (!nextName) {
        throw new BadRequestException('Supplier name is required');
      }

      const duplicate = await this.suppliersRepository.findByName(nextName, existing.organizationId.toString());
      if (duplicate && duplicate._id.toString() !== supplierId) {
        throw new ConflictException('Supplier name already exists in this organization');
      }

      updateData.name = nextName;
    }

    if (updateData.phoneNumber !== undefined) {
      updateData.phoneNumber = updateData.phoneNumber?.trim() || null;
    }

    if (updateData.email !== undefined) {
      updateData.email = updateData.email?.trim() || null;
    }

    return this.repository.updateById(supplierId, updateData, currentUserId);
  }

  async getSuppliersByOrganization(organizationId: string, search?: string) {
    if (!organizationId) {
      throw new BadRequestException('organizationId is required');
    }

    return this.suppliersRepository.findByOrganization(organizationId, search);
  }

  async softDelete(supplierId: string, currentUserId?: string) {
    return this.delete(supplierId, currentUserId);
  }
}