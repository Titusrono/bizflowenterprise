import { BadRequestException, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { BaseService } from '../../common/services/base.service';
import { InventoryRepository } from '../../inventory/repositories/inventory.repository';
import { InventoryService } from '../../inventory/services/inventory.service';
import {
  CreateSaleDto,
  InvoiceStatus,
  PaymentStatus,
  RecordPaymentDto,
  SalePaymentDto,
  SaleType,
} from '../dto/sales.dto';
import { SalesRepository } from '../repositories/sales.repository';
import { SaleDocument } from '../schemas/sale.schema';

@Injectable()
export class SalesService extends BaseService<SaleDocument> {
  constructor(
    private readonly salesRepository: SalesRepository,
    private readonly inventoryRepository: InventoryRepository,
    private readonly inventoryService: InventoryService,
  ) {
    super(salesRepository);
  }

  async createSale(
    createDto: CreateSaleDto,
    userId?: string,
    organizationId?: string,
    branchId?: string | null,
  ) {
    const orgId = createDto.organizationId || organizationId;
    if (!orgId || !Types.ObjectId.isValid(orgId)) {
      throw new BadRequestException('organizationId is required and must be a valid ObjectId');
    }

    const scopedBranchId = createDto.branchId || branchId || null;
    const resolved = await this.resolveLineItems(createDto.lineItems, orgId, scopedBranchId);
    const normalizedPayments = this.normalizePayments(createDto.payments || [], userId);

    const subtotal = resolved.subtotal;
    const totalPaid = this.sumPayments(normalizedPayments);
    const balanceDue = Math.max(subtotal - totalPaid, 0);

    if (createDto.saleType === SaleType.CASH && totalPaid < subtotal) {
      throw new BadRequestException('Cash sales require full payment at the point of sale');
    }

    if (totalPaid > subtotal) {
      throw new BadRequestException('Total payment cannot exceed sale total');
    }

    const paymentStatus = this.calculatePaymentStatus(subtotal, totalPaid);
    const invoiceStatus = this.calculateInvoiceStatus(createDto.saleType, paymentStatus);

    const payload: any = {
      saleNumber: await this.generateSaleNumber(orgId),
      invoiceNumber: createDto.saleType === SaleType.CREDIT ? await this.generateInvoiceNumber(orgId) : null,
      saleType: createDto.saleType,
      organizationId: new Types.ObjectId(orgId),
      branchId: this.toObjectId(scopedBranchId),
      soldBy: userId ? new Types.ObjectId(userId) : undefined,
      customerName: createDto.customerName || null,
      customerPhone: createDto.customerPhone || null,
      notes: createDto.notes || null,
      invoiceDueDate: createDto.invoiceDueDate ? new Date(createDto.invoiceDueDate) : null,
      invoiceStatus,
      paymentStatus,
      subtotal,
      totalPaid,
      balanceDue,
      lineItems: resolved.lineItems,
      payments: normalizedPayments,
    };

    const created = await this.repository.create(payload, userId);

    for (const movement of resolved.inventoryMovement) {
      await this.inventoryService.decreaseQuantity(movement.inventoryId, movement.quantity, userId);
    }

    return created;
  }

  async recordPayment(id: string, dto: RecordPaymentDto, userId?: string) {
    const sale = await this.repository.findById(id);
    if (!sale) {
      throw new BadRequestException('Sale not found');
    }

    const payment = this.normalizePayments([dto.payment], userId)[0];
    const nextTotalPaid = Number(sale.totalPaid || 0) + Number(payment.amount || 0);
    const subtotal = Number(sale.subtotal || 0);

    if (nextTotalPaid > subtotal) {
      throw new BadRequestException('Payment exceeds outstanding sale balance');
    }

    const paymentStatus = this.calculatePaymentStatus(subtotal, nextTotalPaid);
    const invoiceStatus = this.calculateInvoiceStatus(sale.saleType, paymentStatus);

    const payments = [...(sale.payments || []), payment];
    const saleObjectId = new Types.ObjectId(sale._id.toString());

    const updateResult = await this.salesRepository.getModel().updateOne(
      { _id: saleObjectId },
      {
        $set: {
          payments,
          totalPaid: nextTotalPaid,
          balanceDue: Math.max(subtotal - nextTotalPaid, 0),
          paymentStatus,
          invoiceStatus,
          updatedBy: userId ? new Types.ObjectId(userId) : undefined,
          updatedAt: new Date(),
        },
      },
    );

    if (!updateResult.matchedCount) {
      throw new BadRequestException('Sale not found');
    }

    const updatedSale = await this.repository.findById(saleObjectId.toString());
    if (!updatedSale) {
      throw new BadRequestException('Sale not found');
    }

    return updatedSale;
  }

  async getSalesByOrganization(
    organizationId: string,
    branchId?: string | null,
    saleType?: SaleType,
    paymentStatus?: PaymentStatus,
    page: number = 1,
    limit: number = 10,
  ) {
    return this.salesRepository.findByOrganization(
      organizationId,
      branchId,
      saleType,
      paymentStatus,
      page,
      limit,
    );
  }

  async getSalesStats(organizationId: string, branchId?: string | null) {
    return this.salesRepository.getOrganizationStats(organizationId, branchId);
  }

  private toObjectId(value?: string | null): Types.ObjectId | null {
    return value && Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : null;
  }

  private sumPayments(payments: Array<{ amount: number }>): number {
    return payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  }

  private calculatePaymentStatus(total: number, paid: number): PaymentStatus {
    if (paid <= 0) {
      return PaymentStatus.UNPAID;
    }

    if (paid >= total) {
      return PaymentStatus.PAID;
    }

    return PaymentStatus.PARTIAL;
  }

  private calculateInvoiceStatus(saleType: SaleType, paymentStatus: PaymentStatus): InvoiceStatus {
    if (saleType === SaleType.CASH) {
      return InvoiceStatus.CLEARED;
    }

    if (paymentStatus === PaymentStatus.PAID) {
      return InvoiceStatus.CLEARED;
    }

    if (paymentStatus === PaymentStatus.PARTIAL) {
      return InvoiceStatus.PARTIAL;
    }

    return InvoiceStatus.OPEN;
  }

  private normalizePayments(payments: SalePaymentDto[], userId?: string) {
    return payments.map((payment) => ({
      amount: Number(payment.amount),
      method: payment.method,
      paidAt: payment.paidAt ? new Date(payment.paidAt) : new Date(),
      reference: payment.reference || null,
      notes: payment.notes || null,
      recordedBy: userId ? new Types.ObjectId(userId) : undefined,
    }));
  }

  private async resolveLineItems(lineItems: any[], organizationId: string, branchId?: string | null) {
    const normalizedLineItems: any[] = [];
    const stockByInventoryId = new Map<string, number>();

    for (const lineItem of lineItems) {
      const inventory = await this.inventoryRepository.findById(lineItem.inventoryId);
      if (!inventory) {
        throw new BadRequestException(`Inventory item ${lineItem.inventoryId} not found`);
      }

      if (inventory.organizationId.toString() !== organizationId) {
        throw new BadRequestException(`Inventory item ${inventory.sku} does not belong to the active organization`);
      }

      if (branchId && inventory.branchId && inventory.branchId.toString() !== branchId) {
        throw new BadRequestException(`Inventory item ${inventory.sku} does not belong to the active branch`);
      }

      const quantity = Number(lineItem.quantity);
      if (quantity <= 0) {
        throw new BadRequestException('Line item quantity must be greater than zero');
      }

      const unitPrice = lineItem.unitPrice !== undefined
        ? Number(lineItem.unitPrice)
        : Number(inventory.unitPrice || 0);

      const subtotal = quantity * unitPrice;
      const inventoryId = inventory._id.toString();

      normalizedLineItems.push({
        inventoryId: new Types.ObjectId(inventoryId),
        sku: inventory.sku,
        name: inventory.name,
        quantity,
        unitPrice,
        subtotal,
      });

      const runningQuantity = stockByInventoryId.get(inventoryId) || 0;
      stockByInventoryId.set(inventoryId, runningQuantity + quantity);
    }

    let subtotal = 0;
    for (const item of normalizedLineItems) {
      subtotal += Number(item.subtotal || 0);
    }

    const inventoryMovement: Array<{ inventoryId: string; quantity: number }> = [];
    for (const [inventoryId, quantity] of stockByInventoryId.entries()) {
      const inventory = await this.inventoryRepository.findById(inventoryId);
      const available = Number(inventory?.quantity || 0);
      if (!inventory || available < quantity) {
        throw new BadRequestException(`Insufficient stock for inventory item ${inventory?.sku || inventoryId}`);
      }
      inventoryMovement.push({ inventoryId, quantity });
    }

    return {
      lineItems: normalizedLineItems,
      subtotal,
      inventoryMovement,
    };
  }

  private async generateSaleNumber(organizationId: string): Promise<string> {
    const totalCount = await this.salesRepository.countAll({ organizationId: new Types.ObjectId(organizationId) } as any);
    return `SAL-${String(totalCount + 1).padStart(4, '0')}`;
  }

  private async generateInvoiceNumber(organizationId: string): Promise<string> {
    const totalCount = await this.salesRepository.countAll({ organizationId: new Types.ObjectId(organizationId), saleType: SaleType.CREDIT } as any);
    return `INV-${String(totalCount + 1).padStart(4, '0')}`;
  }
}
