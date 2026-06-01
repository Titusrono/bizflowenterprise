import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

/**
 * General Ledger DTOs
 */
export class GeneralLedgerQueryDto {
  @IsString()
  accountId: string;

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
  limit: number = 100;
}

export class AccountBalanceDto {
  @IsString()
  accountId: string;

  @IsOptional()
  @Type(() => Date)
  asOfDate?: Date;
}

export class TrialBalanceQueryDto {
  @IsOptional()
  @IsString()
  period?: string;

  @IsOptional()
  @Type(() => Date)
  asOfDate?: Date;

  @IsOptional()
  @IsNumber()
  accountType?: number;
}
