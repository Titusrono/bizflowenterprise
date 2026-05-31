import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { BaseService } from '../../common/services/base.service';
import { CreateTaxDto, UpdateTaxDto } from '../dto/tax.dto';
import { TaxesRepository } from '../repositories/taxes.repository';
import { TaxDocument } from '../schemas/tax.schema';

@Injectable()
export class TaxesService extends BaseService<TaxDocument> {
  constructor(private readonly taxesRepository: TaxesRepository) {
    super(taxesRepository);
  }

  async createTax(createDto: CreateTaxDto, userId?: string, organizationId?: string) {
    const orgId = organizationId;
    const name = createDto.name?.trim();
    const percentage = Number(createDto.percentage);

    if (!orgId) {
      throw new BadRequestException('organizationId is required');
    }

    if (!name) {
      throw new BadRequestException('Tax name is required');
    }

    if (Number.isNaN(percentage) || percentage < 0 || percentage > 100) {
      throw new BadRequestException('Tax percentage must be between 0 and 100');
    }

    const existing = await this.taxesRepository.findByName(name, orgId);
    if (existing) {
      throw new ConflictException('Tax name already exists in this organization');
    }

    const taxData = {
      name,
      percentage,
      organizationId: new Types.ObjectId(orgId),
    };

    return this.create(taxData as any, userId);
  }

  async updateTax(taxId: string, updateDto: UpdateTaxDto, currentUserId?: string) {
    const existing = await this.repository.findById(taxId);
    if (!existing) {
      throw new BadRequestException('Tax not found');
    }

    const updateData: Record<string, any> = { ...updateDto };

    if (updateData.name !== undefined) {
      const nextName = updateData.name?.trim();
      if (!nextName) {
        throw new BadRequestException('Tax name is required');
      }

      const duplicate = await this.taxesRepository.findByName(nextName, existing.organizationId.toString());
      if (duplicate && duplicate._id.toString() !== taxId) {
        throw new ConflictException('Tax name already exists in this organization');
      }

      updateData.name = nextName;
    }

    if (updateData.percentage !== undefined) {
      const nextPercentage = Number(updateData.percentage);
      if (Number.isNaN(nextPercentage) || nextPercentage < 0 || nextPercentage > 100) {
        throw new BadRequestException('Tax percentage must be between 0 and 100');
      }
      updateData.percentage = nextPercentage;
    }

    return this.repository.updateById(taxId, updateData, currentUserId);
  }

  async getTaxesByOrganization(organizationId: string, search?: string) {
    if (!organizationId) {
      throw new BadRequestException('organizationId is required');
    }

    return this.taxesRepository.findByOrganization(organizationId, search);
  }

  async softDelete(taxId: string, currentUserId?: string) {
    return this.delete(taxId, currentUserId);
  }
}