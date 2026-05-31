import { Injectable } from '@nestjs/common';
import { ExpensesRepository } from '../repositories/expenses.repository';
import { CreateExpenseDto, ExpensePaymentDto, PaymentStatus, UpdateExpenseDto } from '../dto/expense.dto';
import { Types } from 'mongoose';

@Injectable()
export class ExpensesService {
  constructor(private readonly expensesRepository: ExpensesRepository) {}

  async create(dto: CreateExpenseDto, userId?: string) {
    const payload: any = {
      ...dto,
      expenseNumber: dto.referenceNumber || `EXP-${Date.now()}`,
      organizationId: new Types.ObjectId((dto as any).organizationId || (dto as any).orgId),
      amount: dto.amount ?? 0,
      status: 'OPEN',
      totalPaid: 0,
      balanceDue: dto.amount ?? 0,
      paymentStatus: PaymentStatus.UNPAID,
      payments: [],
    };

    return this.expensesRepository.create(payload, userId);
  }

  async findByOrganization(orgId: string, page = 1, limit = 20) {
    return this.expensesRepository.findByOrganization(orgId, page, limit);
  }

  async findById(id: string) {
    return this.expensesRepository.findById(id);
  }

  async update(id: string, dto: UpdateExpenseDto, userId?: string) {
    return this.expensesRepository.updateById(id, dto as any, userId);
  }

  async recordPayment(id: string, payment: ExpensePaymentDto, userId?: string) {
    const expense = await this.expensesRepository.findById(id);
    if (!expense) return null;

    const existingPayments = Array.isArray((expense as any).payments) ? (expense as any).payments : [];
    const nextTotalPaid = Number((expense as any).totalPaid || 0) + Number(payment.amount || 0);
    const total = Number((expense as any).amount || 0);
    const balanceDue = Math.max(total - nextTotalPaid, 0);
    const paymentStatus = balanceDue <= 0 ? PaymentStatus.PAID : nextTotalPaid > 0 ? PaymentStatus.PARTIAL : PaymentStatus.UNPAID;

    return this.expensesRepository.updateById(
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
    return this.expensesRepository.softDelete(id, userId);
  }
}
