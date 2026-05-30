import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { DocumentStatus } from '../../common/schemas/base.schema';

export class CreateInventoryDto {
  @IsString()
  @MaxLength(150)
  name: string;

  @IsString()
  @MaxLength(80)
  sku: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  category?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  quantity: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  costPrice: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  reorderLevel: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  location?: string;

  @IsOptional()
  @IsString()
  organizationId?: string;

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;
}

export class UpdateInventoryDto extends PartialType(CreateInventoryDto) {}
