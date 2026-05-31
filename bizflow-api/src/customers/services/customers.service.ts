import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { BaseService } from '../../common/services/base.service';
import { CreateCustomerDto, UpdateCustomerDto } from '../dto/customer.dto';
import { CustomersRepository } from '../repositories/customers.repository';
import { CustomerDocument } from '../schemas/customer.schema';

@Injectable()
export class CustomersService extends BaseService<CustomerDocument> {
  constructor(private readonly customersRepository: CustomersRepository) {
    super(customersRepository);
  }

  async createCustomer(createDto: CreateCustomerDto, userId?: string, organizationId?: string) {
    const orgId = organizationId;
    const name = createDto.name?.trim();

    if (!orgId) {
      throw new BadRequestException('organizationId is required');
    }

    if (!name) {
      throw new BadRequestException('Customer name is required');
    }

    const existing = await this.customersRepository.findByName(name, orgId);
    if (existing) {
      throw new ConflictException('Customer name already exists in this organization');
    }

    const customerData = {
      name,
      phoneNumber: createDto.phoneNumber?.trim() || null,
      email: createDto.email?.trim() || null,
      organizationId: new Types.ObjectId(orgId),
    };

    return this.create(customerData as any, userId);
  }

  async updateCustomer(customerId: string, updateDto: UpdateCustomerDto, currentUserId?: string) {
    const existing = await this.repository.findById(customerId);
    if (!existing) {
      throw new BadRequestException('Customer not found');
    }

    const updateData: Record<string, any> = { ...updateDto };
    if (updateData.name !== undefined) {
      const nextName = updateData.name?.trim();
      if (!nextName) {
        throw new BadRequestException('Customer name is required');
      }

      const duplicate = await this.customersRepository.findByName(nextName, existing.organizationId.toString());
      if (duplicate && duplicate._id.toString() !== customerId) {
        throw new ConflictException('Customer name already exists in this organization');
      }

      updateData.name = nextName;
    }

    if (updateData.phoneNumber !== undefined) {
      updateData.phoneNumber = updateData.phoneNumber?.trim() || null;
    }

    if (updateData.email !== undefined) {
      updateData.email = updateData.email?.trim() || null;
    }

    return this.repository.updateById(customerId, updateData, currentUserId);
  }

  async getCustomersByOrganization(organizationId: string, search?: string) {
    if (!organizationId) {
      throw new BadRequestException('organizationId is required');
    }

    return this.customersRepository.findByOrganization(organizationId, search);
  }

  async softDelete(customerId: string, currentUserId?: string) {
    return this.delete(customerId, currentUserId);
  }
}