import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseRepository } from '../../common/repositories/base.repository';
import { InvoiceStatus, PaymentStatus, SaleType } from '../dto/sales.dto';
import { Sale, SaleDocument } from '../schemas/sale.schema';

@Injectable()
export class SalesRepository extends BaseRepository<SaleDocument> {
  constructor(@InjectModel(Sale.name) private readonly saleModel: Model<SaleDocument>) {
    super(saleModel);
  }

  async findByOrganization(
    organizationId: string,
    branchId?: string | null,
    saleType?: SaleType,
    paymentStatus?: PaymentStatus,
    page: number = 1,
    limit: number = 10,
  ) {
    const filter: any = {
      organizationId: new Types.ObjectId(organizationId),
    };

    if (branchId) {
      filter.branchId = new Types.ObjectId(branchId);
    }

    if (saleType) {
      filter.saleType = saleType;
    }

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
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
          totalSales: { $sum: 1 },
          cashSales: { $sum: { $cond: [{ $eq: ['$saleType', SaleType.CASH] }, 1, 0] } },
          creditSales: { $sum: { $cond: [{ $eq: ['$saleType', SaleType.CREDIT] }, 1, 0] } },
          paidSales: { $sum: { $cond: [{ $eq: ['$paymentStatus', PaymentStatus.PAID] }, 1, 0] } },
          unpaidSales: { $sum: { $cond: [{ $eq: ['$paymentStatus', PaymentStatus.UNPAID] }, 1, 0] } },
          partialSales: { $sum: { $cond: [{ $eq: ['$paymentStatus', PaymentStatus.PARTIAL] }, 1, 0] } },
          openInvoices: { $sum: { $cond: [{ $eq: ['$invoiceStatus', InvoiceStatus.OPEN] }, 1, 0] } },
          clearedInvoices: { $sum: { $cond: [{ $eq: ['$invoiceStatus', InvoiceStatus.CLEARED] }, 1, 0] } },
          totalValue: { $sum: '$subtotal' },
          totalCollected: { $sum: '$totalPaid' },
          totalOutstanding: { $sum: '$balanceDue' },
        },
      },
    ]);

    return {
      totalSales: totals?.totalSales || 0,
      cashSales: totals?.cashSales || 0,
      creditSales: totals?.creditSales || 0,
      paidSales: totals?.paidSales || 0,
      unpaidSales: totals?.unpaidSales || 0,
      partialSales: totals?.partialSales || 0,
      openInvoices: totals?.openInvoices || 0,
      clearedInvoices: totals?.clearedInvoices || 0,
      totalValue: totals?.totalValue || 0,
      totalCollected: totals?.totalCollected || 0,
      totalOutstanding: totals?.totalOutstanding || 0,
    };
  }
}
