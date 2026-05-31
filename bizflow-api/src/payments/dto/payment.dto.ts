import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export enum PaymentProviderType {
  CASH = 'cash',
  MPESA = 'mpesa',
  TILL = 'till',
  PAYBILL = 'paybill',
  BANK = 'bank',
}

export class CreatePaymentDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name: string;

  @IsEnum(PaymentProviderType)
  providerType: PaymentProviderType;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  accountName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  bankName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  branchName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  tillNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  paybillNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  accountNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdatePaymentDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsEnum(PaymentProviderType)
  providerType?: PaymentProviderType;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  accountName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  bankName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  branchName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  tillNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  paybillNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  accountNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isDefault?: boolean;
}