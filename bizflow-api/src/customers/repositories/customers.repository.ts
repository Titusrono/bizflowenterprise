import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseRepository } from '../../common/repositories/base.repository';
import { Customer, CustomerDocument } from '../schemas/customer.schema';

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

@Injectable()
export class CustomersRepository extends BaseRepository<CustomerDocument> {
  constructor(
    @InjectModel(Customer.name)
    private readonly customerModel: Model<CustomerDocument>,
  ) {
    super(customerModel);
  }

  async findByOrganization(organizationId: string, search?: string) {
    const orgObjectId = new Types.ObjectId(organizationId);
    const filter: Record<string, any> = {
      organizationId: orgObjectId,
      isDeleted: { $ne: true },
    };

    if (search?.trim()) {
      const query = escapeRegex(search.trim());
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { phoneNumber: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ];
    }

    return this.getModel()
      .find(filter)
      .sort({ name: 1 })
      .lean()
      .exec();
  }

  async findByName(name: string, organizationId: string): Promise<CustomerDocument | null> {
    const orgObjectId = new Types.ObjectId(organizationId);

    return this.getModel()
      .findOne({
        organizationId: orgObjectId,
        isDeleted: { $ne: true },
        name: { $regex: `^${escapeRegex(name.trim())}$`, $options: 'i' },
      })
      .lean()
      .exec();
  }
}