import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseRepository } from '../../common/repositories/base.repository';
import { Purchase, PurchaseDocument } from '../schemas/purchase.schema';

@Injectable()
export class PurchasesRepository extends BaseRepository<PurchaseDocument> {
  constructor(
    @InjectModel(Purchase.name)
    private readonly purchaseModel: Model<PurchaseDocument>,
  ) {
    super(purchaseModel);
  }

  async findByOrganization(organizationId: string, page = 1, limit = 20) {
    const orgId = new Types.ObjectId(organizationId);
    return this.findAllPaginated({ organizationId: orgId }, page, limit);
  }
}
