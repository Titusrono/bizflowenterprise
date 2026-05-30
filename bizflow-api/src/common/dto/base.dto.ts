import { IsOptional, IsNumber, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Base Paginated Query DTO
 * Used for queries that support pagination
 */
export class PaginatedQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

/**
 * Base Filter DTO
 * Common filter operations
 */
export class BaseFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @Type(() => Date)
  createdAfter?: Date;

  @IsOptional()
  @Type(() => Date)
  createdBefore?: Date;

  @IsOptional()
  @Type(() => Date)
  updatedAfter?: Date;

  @IsOptional()
  @Type(() => Date)
  updatedBefore?: Date;
}

/**
 * Base Paginated Response DTO
 * Standard response format for paginated results
 */
export class PaginatedResponseDto<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;

  constructor(data: T[], total: number, page: number, limit: number) {
    this.data = data;
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
    this.hasMore = page < this.totalPages;
  }
}

/**
 * Base API Response DTO
 * Standard response format for single item responses
 */
export class ApiResponseDto<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;

  constructor(
    success: boolean,
    message: string,
    data?: T,
    error?: string,
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.error = error;
    this.timestamp = new Date().toISOString();
  }

  static success<T>(message: string, data?: T): ApiResponseDto<T> {
    return new ApiResponseDto(true, message, data);
  }

  static error<T = any>(message: string, error?: string): ApiResponseDto<T> {
    return new ApiResponseDto(false, message, undefined, error);
  }
}

/**
 * Bulk Operation Result DTO
 */
export class BulkOperationResultDto {
  successCount: number;
  failureCount: number;
  errors?: Array<{ index: number; error: string }>;
}
