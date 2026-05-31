import { IsArray, IsDateString, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PurchaseLineItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsNumber()
  @Min(0)
  subtotal: number;
}

export enum PurchaseStatus {
  OPEN = 'OPEN',
  APPROVED = 'APPROVED',
  PARTIALLY_RECEIVED = 'PARTIALLY_RECEIVED',
  RECEIVED = 'RECEIVED',
  PAID = 'PAID',
  CONVERTED_TO_BILL = 'CONVERTED_TO_BILL',
}

export type PurchaseBillSource = 'ordered' | 'received';

export class PurchaseReceiptDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseLineItemDto)
  lineItems: PurchaseLineItemDto[];

  @IsString()
  @IsOptional()
  notes?: string;

  @IsDateString()
  @IsOptional()
  receivedAt?: string;
}

export class ConvertPurchaseToBillDto {
  @IsIn(['ordered', 'received'])
  @IsOptional()
  source?: PurchaseBillSource;
}

export class CreatePurchaseDto {
  @IsString()
  @IsOptional()
  organizationId?: string;

  @IsString()
  @IsOptional()
  referenceNumber?: string;

  @IsString()
  @IsNotEmpty()
  supplierId: string;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseLineItemDto)
  lineItems: PurchaseLineItemDto[];

  @IsNumber()
  @IsOptional()
  subtotal?: number;

  @IsNumber()
  @IsOptional()
  total?: number;
}

export class UpdatePurchaseDto {
  @IsString()
  @IsOptional()
  referenceNumber?: string;

  @IsString()
  @IsOptional()
  supplierId?: string;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseLineItemDto)
  @IsOptional()
  lineItems?: PurchaseLineItemDto[];

  @IsNumber()
  @IsOptional()
  subtotal?: number;

  @IsNumber()
  @IsOptional()
  total?: number;
}
