import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseRepository } from '../../common/repositories/base.repository';
import { Payment, PaymentDocument } from '../schemas/payment.schema';

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

@Injectable()
export class PaymentsRepository extends BaseRepository<PaymentDocument> {
  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
  ) {
    super(paymentModel);
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
        { accountName: { $regex: query, $options: 'i' } },
        { bankName: { $regex: query, $options: 'i' } },
        { phoneNumber: { $regex: query, $options: 'i' } },
        { tillNumber: { $regex: query, $options: 'i' } },
        { paybillNumber: { $regex: query, $options: 'i' } },
        { accountNumber: { $regex: query, $options: 'i' } },
      ];
    }

    return this.getModel()
      .find(filter)
      .sort({ isDefault: -1, name: 1 })
      .lean()
      .exec();
  }

  async findByName(name: string, organizationId: string): Promise<PaymentDocument | null> {
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