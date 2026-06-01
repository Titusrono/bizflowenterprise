import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

/**
 * Journal Entry DTOs
 */
export class JournalLineItemDto {
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  accountCode: string;

  @IsString()
  @MinLength(3)
  @MaxLength(150)
  accountName: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  debit: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  credit: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  narration?: string;

  @IsString()
  accountId: string;
}

export class CreateJournalDto {
  @IsString()
  @IsEnum(['GL', 'SJ', 'PJ', 'CRJ', 'CPJ'])
  journalType: string;

  @Type(() => Date)
  journalDate: Date;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  referenceNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  referenceType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  narration?: string;

  @Type(() => JournalLineItemDto)
  lineItems: JournalLineItemDto[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  totalDebit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  totalCredit?: number;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @IsOptional()
  @IsString()
  period?: string;

  @IsOptional()
  @IsString()
  organizationId?: string;

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  attachmentUrl?: string;
}

export class UpdateJournalDto {
  @IsOptional()
  @Type(() => Date)
  journalDate?: Date;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  narration?: string;

  @IsOptional()
  @Type(() => JournalLineItemDto)
  lineItems?: JournalLineItemDto[];

  @IsOptional()
  @IsString()
  @IsEnum(['APPROVED', 'REJECTED'])
  approvalStatus?: string;
}

export class PostJournalDto {
  @IsString()
  journalId: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  approvalNotes?: string;
}

export class JournalQueryDto {
  @IsOptional()
  @IsString()
  @IsEnum(['GL', 'SJ', 'PJ', 'CRJ', 'CPJ'])
  journalType?: string;

  @IsOptional()
  @IsString()
  @IsEnum(['DRAFT', 'POSTED', 'REVERSED'])
  status?: string;

  @IsOptional()
  @Type(() => Date)
  fromDate?: Date;

  @IsOptional()
  @Type(() => Date)
  toDate?: Date;

  @IsOptional()
  @IsString()
  period?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit: number = 50;
}
