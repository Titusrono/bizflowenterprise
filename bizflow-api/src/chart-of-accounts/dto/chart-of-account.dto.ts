import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

/**
 * Chart of Account DTOs
 */
export class CreateChartOfAccountDto {
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  accountCode: string;

  @IsString()
  @MinLength(3)
  @MaxLength(150)
  name: string;

  @IsNumber()
  @IsEnum([1, 2, 3, 4, 5, 6])
  accountType: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  subCategory?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  openingBalance?: number;

  @IsString()
  @IsEnum(['Debit', 'Credit'])
  normalBalance: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  parentCode?: string;

  @IsOptional()
  @IsBoolean()
  isHeader?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isOrganizationWide?: boolean;

  @IsOptional()
  @IsString()
  organizationId?: string;

  @IsOptional()
  @IsString()
  branchId?: string;
}

export class UpdateChartOfAccountDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  subCategory?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  currentBalance?: number;
}

export class ChartOfAccountQueryDto {
  @IsOptional()
  @IsNumber()
  accountType?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  accountCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  subCategory?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

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
