import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { BaseService } from '../../common/services/base.service';
import { CreatePaymentDto, UpdatePaymentDto } from '../dto/payment.dto';
import { PaymentsRepository } from '../repositories/payments.repository';
import { PaymentDocument } from '../schemas/payment.schema';

@Injectable()
export class PaymentsService extends BaseService<PaymentDocument> {
  constructor(private readonly paymentsRepository: PaymentsRepository) {
    super(paymentsRepository);
  }

  async createPayment(createDto: CreatePaymentDto, userId?: string, organizationId?: string) {
    const orgId = organizationId;
    const name = createDto.name?.trim();

    if (!orgId) {
      throw new BadRequestException('organizationId is required');
    }

    if (!name) {
      throw new BadRequestException('Payment name is required');
    }

    this.validateKenyanPaymentDetails(createDto);

    const existing = await this.paymentsRepository.findByName(name, orgId);
    if (existing) {
      throw new ConflictException('Payment name already exists in this organization');
    }

    const paymentData = {
      name,
      providerType: createDto.providerType,
      accountName: createDto.accountName?.trim() || null,
      bankName: createDto.bankName?.trim() || null,
      branchName: createDto.branchName?.trim() || null,
      phoneNumber: createDto.phoneNumber?.trim() || null,
      tillNumber: createDto.tillNumber?.trim() || null,
      paybillNumber: createDto.paybillNumber?.trim() || null,
      accountNumber: createDto.accountNumber?.trim() || null,
      notes: createDto.notes?.trim() || null,
      isDefault: Boolean(createDto.isDefault),
      organizationId: new Types.ObjectId(orgId),
    };

    if (paymentData.isDefault) {
      await this.clearOtherDefaults(orgId);
    }

    return this.create(paymentData as any, userId);
  }

  async updatePayment(paymentId: string, updateDto: UpdatePaymentDto, currentUserId?: string) {
    const existing = await this.repository.findById(paymentId);
    if (!existing) {
      throw new BadRequestException('Payment not found');
    }

    const updateData: Record<string, any> = { ...updateDto };
    if (updateData.name !== undefined) {
      const nextName = updateData.name?.trim();
      if (!nextName) {
        throw new BadRequestException('Payment name is required');
      }

      const duplicate = await this.paymentsRepository.findByName(nextName, existing.organizationId.toString());
      if (duplicate && duplicate._id.toString() !== paymentId) {
        throw new ConflictException('Payment name already exists in this organization');
      }

      updateData.name = nextName;
    }

    if (updateData.providerType !== undefined) {
      this.validateKenyanPaymentDetails(updateData as CreatePaymentDto);
    }

    if (updateData.isDefault === true) {
      await this.clearOtherDefaults(existing.organizationId.toString(), paymentId);
    }

    return this.repository.updateById(paymentId, updateData, currentUserId);
  }

  async getPaymentsByOrganization(organizationId: string, search?: string) {
    if (!organizationId) {
      throw new BadRequestException('organizationId is required');
    }

    return this.paymentsRepository.findByOrganization(organizationId, search);
  }

  async softDelete(paymentId: string, currentUserId?: string) {
    return this.delete(paymentId, currentUserId);
  }

  private validateKenyanPaymentDetails(payload: Partial<CreatePaymentDto | UpdatePaymentDto>): void {
    const providerType = payload.providerType;
    if (!providerType) {
      throw new BadRequestException('Payment provider type is required');
    }

    if (providerType === 'mpesa') {
      if (!payload.phoneNumber?.trim()) {
        throw new BadRequestException('Mpesa payments require a phone number');
      }
      return;
    }

    if (providerType === 'till') {
      if (!payload.tillNumber?.trim()) {
        throw new BadRequestException('Till payments require a till number');
      }
      if (!payload.accountName?.trim()) {
        throw new BadRequestException('Till payments require an account name');
      }
      return;
    }

    if (providerType === 'paybill') {
      if (!payload.paybillNumber?.trim()) {
        throw new BadRequestException('Paybill payments require a paybill number');
      }
      if (!payload.accountNumber?.trim()) {
        throw new BadRequestException('Paybill payments require an account number');
      }
      return;
    }

    if (providerType === 'bank') {
      if (!payload.bankName?.trim()) {
        throw new BadRequestException('Bank payments require a bank name');
      }
      if (!payload.accountNumber?.trim()) {
        throw new BadRequestException('Bank payments require an account number');
      }
    }
  }

  private async clearOtherDefaults(organizationId: string, excludeId?: string): Promise<void> {
    await this.paymentsRepository.updateMany(
      {
        organizationId: new Types.ObjectId(organizationId),
        ...(excludeId ? { _id: { $ne: new Types.ObjectId(excludeId) } } : {}),
      } as any,
      { isDefault: false } as any,
    );
  }
}