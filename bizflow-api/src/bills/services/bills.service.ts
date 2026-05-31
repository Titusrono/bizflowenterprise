import { Injectable } from '@nestjs/common';
import { BillsRepository } from '../repositories/bills.repository';
import { BillPaymentDto, CreateBillDto, PaymentStatus, UpdateBillDto } from '../dto/bill.dto';
import { Types } from 'mongoose';

@Injectable()
export class BillsService {
  constructor(private readonly billsRepository: BillsRepository) {}

  async create(dto: CreateBillDto, userId?: string) {
    const payload: any = {
      ...dto,
      billNumber: dto.billNumber || `BILL-${Date.now()}`,
      organizationId: new Types.ObjectId((dto as any).organizationId || (dto as any).orgId),
      subtotal: dto.subtotal ?? 0,
      total: dto.total ?? 0,
      status: 'OPEN',
      totalPaid: 0,
      balanceDue: dto.total ?? dto.subtotal ?? 0,
      paymentStatus: PaymentStatus.UNPAID,
      payments: [],
    };

    return this.billsRepository.create(payload, userId);
  }

  async findByOrganization(organizationId: string, page = 1, limit = 20) {
    return this.billsRepository.findByOrganization(organizationId, page, limit);
  }

  async findById(id: string) {
    return this.billsRepository.findById(id);
  }

  async update(id: string, dto: UpdateBillDto, userId?: string) {
    return this.billsRepository.updateById(id, dto as any, userId);
  }

  async recordPayment(id: string, payment: BillPaymentDto, userId?: string) {
    const bill = await this.billsRepository.findById(id);
    if (!bill) return null;

    const existingPayments = Array.isArray((bill as any).payments) ? (bill as any).payments : [];
    const nextTotalPaid = Number((bill as any).totalPaid || 0) + Number(payment.amount || 0);
    const total = Number((bill as any).total || 0);
    const balanceDue = Math.max(total - nextTotalPaid, 0);
    const paymentStatus = balanceDue <= 0 ? PaymentStatus.PAID : nextTotalPaid > 0 ? PaymentStatus.PARTIAL : PaymentStatus.UNPAID;

    return this.billsRepository.updateById(
      id,
      {
        totalPaid: nextTotalPaid,
        balanceDue,
        paymentStatus,
        status: paymentStatus === PaymentStatus.PAID ? 'CLEARED' : 'PARTIAL',
        payments: [
          ...existingPayments,
          {
            amount: payment.amount,
            method: payment.method,
            paidAt: payment.paidAt ? new Date(payment.paidAt) : new Date(),
            reference: payment.reference || null,
            notes: payment.notes || null,
          },
        ],
      } as any,
      userId,
    );
  }

  async delete(id: string, userId?: string) {
    return this.billsRepository.softDelete(id, userId);
  }
}
