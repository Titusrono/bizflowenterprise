import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseRepository } from '../../common/repositories/base.repository';
import { RestockRequest, RestockRequestDocument } from '../schemas/restock.schema';
import { RestockRequestStatus } from '../dto/restock.dto';

@Injectable()
export class RestockRepository extends BaseRepository<RestockRequestDocument> {
  constructor(@InjectModel(RestockRequest.name) private readonly restockModel: Model<RestockRequestDocument>) {
    super(restockModel);
  }

  async findByOrganization(
    organizationId: string,
    branchId?: string | null,
    page: number = 1,
    limit: number = 10,
  ) {
    const filter: any = {
      organizationId: new Types.ObjectId(organizationId),
    };

    if (branchId) {
      filter.branchId = new Types.ObjectId(branchId);
    }

    return this.findAllPaginated(filter, page, limit);
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
      { $match: match },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          draft: { $sum: { $cond: [{ $eq: ['$status', RestockRequestStatus.DRAFT] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', RestockRequestStatus.PENDING] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ['$status', RestockRequestStatus.APPROVED] }, 1, 0] } },
          lineItems: { $sum: { $size: '$lineItems' } },
        },
      },
    ]);

    return {
      total: totals?.total || 0,
      draft: totals?.draft || 0,
      pending: totals?.pending || 0,
      approved: totals?.approved || 0,
      lineItems: totals?.lineItems || 0,
    };
  }
}
