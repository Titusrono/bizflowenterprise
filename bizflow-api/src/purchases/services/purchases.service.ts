import { Injectable } from '@nestjs/common';
import { PurchasesRepository } from '../repositories/purchases.repository';
import { CreatePurchaseDto, PurchaseBillSource, PurchaseLineItemDto, PurchaseReceiptDto, PurchaseStatus, UpdatePurchaseDto } from '../dto/purchase.dto';
import { Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Purchase, PurchaseDocument } from '../schemas/purchase.schema';
import { BillsRepository } from '../../bills/repositories/bills.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';

@Injectable()
export class PurchasesService {
  constructor(
    private readonly purchasesRepository: PurchasesRepository,
    private readonly billsRepository: BillsRepository,
    @InjectModel(Purchase.name)
    private readonly purchaseModel: Model<PurchaseDocument>,
  ) {}

  async create(createDto: CreatePurchaseDto, userId?: string) {
    const payload: any = {
      ...createDto,
      organizationId: new Types.ObjectId((createDto as any).organizationId || (createDto as any).orgId),
      purchaseNumber: createDto.referenceNumber || `PUR-${Date.now()}`,
      subtotal: createDto.subtotal ?? 0,
      total: createDto.total ?? 0,
      status: PurchaseStatus.OPEN,
    };

    return this.purchasesRepository.create(payload, userId);
  }

  async findByOrganization(organizationId: string, page = 1, limit = 20) {
    return this.purchasesRepository.findByOrganization(organizationId, page, limit);
  }

  async findById(id: string) {
    return this.purchasesRepository.findById(id);
  }

  async update(id: string, updateDto: UpdatePurchaseDto, userId?: string) {
    return this.purchasesRepository.updateById(id, updateDto as any, userId);
  }

  async approve(id: string, userId?: string) {
    return this.purchasesRepository.updateById(id, { status: PurchaseStatus.APPROVED } as any, userId);
  }

  async recordReceipt(id: string, receipt: PurchaseReceiptDto, userId?: string) {
    const purchase = await this.purchasesRepository.findById(id);
    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }

    const orderedItems = this.aggregateLineItems((purchase as any).lineItems || []);
    const receivedItems = this.aggregateReceiptLineItems((purchase as any).receipts || []);
    const receiptItems = this.normalizeLineItems(receipt.lineItems);

    for (const item of receiptItems) {
      const orderedItem = orderedItems.get(item.name.toLowerCase());
      if (!orderedItem) {
        throw new BadRequestException(`Item ${item.name} is not part of this purchase order`);
      }

      const alreadyReceived = receivedItems.get(item.name.toLowerCase())?.quantity || 0;
      const remaining = Number(orderedItem.quantity || 0) - Number(alreadyReceived || 0);
      if (item.quantity > remaining) {
        throw new BadRequestException(`Item ${item.name} exceeds the remaining ordered quantity`);
      }
    }

    const nextReceipts = [
      ...((purchase as any).receipts || []),
      {
        receivedAt: receipt.receivedAt ? new Date(receipt.receivedAt) : new Date(),
        notes: receipt.notes || null,
        lineItems: receiptItems,
      },
    ];

    const nextReceivedItems = this.aggregateReceiptLineItems(nextReceipts);
    const receivedTotal = this.sumItems(nextReceivedItems.values());
    const orderTotal = Number((purchase as any).total || 0);
    const balanceDue = Math.max(orderTotal - receivedTotal, 0);
    const status = receivedTotal >= orderTotal ? PurchaseStatus.RECEIVED : PurchaseStatus.PARTIALLY_RECEIVED;

    return this.purchasesRepository.updateById(
      id,
      {
        receipts: nextReceipts,
        receivedTotal,
        balanceDue,
        status,
      } as any,
      userId,
    );
  }

  async markPaid(id: string, userId?: string) {
    return this.purchasesRepository.updateById(id, { status: PurchaseStatus.PAID } as any, userId);
  }

  async delete(id: string, userId?: string) {
    return this.purchasesRepository.softDelete(id, userId);
  }

  async convertToBill(purchaseId: string, userId?: string, source: PurchaseBillSource = 'ordered') {
    const purchase = await this.purchasesRepository.findById(purchaseId);
    if (!purchase) return null;

    const sourceLineItems = source === 'received' ? this.getReceivedBillLineItems(purchase) : this.normalizeLineItems((purchase as any).lineItems || []);
    if (source === 'received' && !sourceLineItems.length) {
      throw new BadRequestException('No received items are available to convert into a bill');
    }

    const billTotal = this.sumItems(sourceLineItems);

    // Create bill payload
    const billPayload: any = {
      purchaseId: purchase._id,
      supplierId: purchase.supplierId,
      organizationId: purchase.organizationId,
      billNumber: `BILL-${Date.now()}`,
      date: new Date(),
      subtotal: billTotal,
      total: billTotal,
      lineItems: sourceLineItems,
      status: 'OPEN',
    };

    const createdBill = await this.billsRepository.create(billPayload, userId);

    // mark purchase as converted
    await this.purchasesRepository.updateById(purchaseId, { status: PurchaseStatus.CONVERTED_TO_BILL, billId: createdBill._id } as any, userId);

    return createdBill;
  }

  private normalizeLineItems(items: PurchaseLineItemDto[]): PurchaseLineItemDto[] {
    return items.map((item) => ({
      ...item,
      quantity: Number(item.quantity || 0),
      unitPrice: Number(item.unitPrice || 0),
      subtotal: Number(item.subtotal || Number(item.quantity || 0) * Number(item.unitPrice || 0)),
    }));
  }

  private aggregateLineItems(items: PurchaseLineItemDto[]) {
    const normalized = new Map<string, PurchaseLineItemDto>();
    for (const item of this.normalizeLineItems(items)) {
      const key = item.name.toLowerCase();
      const existing = normalized.get(key);
      if (!existing) {
        normalized.set(key, { ...item });
        continue;
      }

      existing.quantity += item.quantity;
      existing.subtotal += item.subtotal;
      existing.unitPrice = item.unitPrice;
      normalized.set(key, existing);
    }
    return normalized;
  }

  private aggregateReceiptLineItems(receipts: any[]) {
    const normalized = new Map<string, PurchaseLineItemDto>();
    for (const receipt of receipts) {
      for (const item of this.normalizeLineItems(receipt.lineItems || [])) {
        const key = item.name.toLowerCase();
        const existing = normalized.get(key);
        if (!existing) {
          normalized.set(key, { ...item });
          continue;
        }

        existing.quantity += item.quantity;
        existing.subtotal += item.subtotal;
        existing.unitPrice = item.unitPrice;
        normalized.set(key, existing);
      }
    }
    return normalized;
  }

  private getReceivedBillLineItems(purchase: any): PurchaseLineItemDto[] {
    const received = this.aggregateReceiptLineItems(purchase.receipts || []);
    return Array.from(received.values());
  }

  private sumItems(items: Iterable<PurchaseLineItemDto>): number {
    return Array.from(items).reduce((sum, item) => sum + Number(item.subtotal || 0), 0);
  }
}
