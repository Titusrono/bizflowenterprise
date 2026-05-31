import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export enum SaleType {
  CASH = 'cash',
  CREDIT = 'credit',
}

export enum PaymentMethod {
  BANK = 'bank',
  CASH = 'cash',
  MPESA = 'mpesa',
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PARTIAL = 'partial',
  PAID = 'paid',
}

export enum InvoiceStatus {
  OPEN = 'open',
  PARTIAL = 'partial',
  CLEARED = 'cleared',
}

export class SaleLineItemDto {
  @IsMongoId()
  inventoryId: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  sku?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  unitPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  subtotal?: number;
}

export class SalePaymentDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsOptional()
  @IsDateString()
  paidAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  reference?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  notes?: string;
}

export class CreateSaleDto {
  @IsEnum(SaleType)
  saleType: SaleType;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  customerName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  customerPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @IsOptional()
  @IsDateString()
  invoiceDueDate?: string;

  @IsOptional()
  @IsString()
  organizationId?: string;

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SaleLineItemDto)
  lineItems: SaleLineItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SalePaymentDto)
  payments?: SalePaymentDto[];
}

export class RecordPaymentDto {
  @ValidateNested()
  @Type(() => SalePaymentDto)
  payment: SalePaymentDto;
}
