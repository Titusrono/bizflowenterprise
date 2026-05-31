import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseRepository } from '../../common/repositories/base.repository';
import { Bill, BillDocument } from '../schemas/bill.schema';

@Injectable()
export class BillsRepository extends BaseRepository<BillDocument> {
  constructor(
    @InjectModel(Bill.name)
    private readonly billModel: Model<BillDocument>,
  ) {
    super(billModel);
  }

  async findByOrganization(organizationId: string, page = 1, limit = 20) {
    const orgId = new Types.ObjectId(organizationId);
    return this.findAllPaginated({ organizationId: orgId }, page, limit);
  }
}
