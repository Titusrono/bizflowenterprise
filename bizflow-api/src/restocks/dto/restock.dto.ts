import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export enum RestockRequestStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export class RestockLineItemDto {
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
  requestedQuantity: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  approvedQuantity?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  unitCost?: number;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  notes?: string;
}

export class CreateRestockRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  referenceNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @IsOptional()
  @IsString()
  organizationId?: string;

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  @IsEnum(RestockRequestStatus)
  status?: RestockRequestStatus;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RestockLineItemDto)
  lineItems: RestockLineItemDto[];
}

export class UpdateRestockRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  referenceNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @IsOptional()
  @IsEnum(RestockRequestStatus)
  status?: RestockRequestStatus;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RestockLineItemDto)
  lineItems?: RestockLineItemDto[];
}

export class ApproveRestockRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  approvalNotes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RestockLineItemDto)
  lineItems?: RestockLineItemDto[];
}
