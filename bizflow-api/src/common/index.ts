/**
 * Common Exports
 * Central export file for all common utilities, bases, and services
 * Import from '@common' or '@common/index' in feature modules
 */

// Base Schema
export {
  BaseDocument,
  DocumentStatus,
  StatusFields,
} from './schemas/base.schema';

// Base Repository
export { BaseRepository } from './repositories/base.repository';

// Base Service
export { BaseService } from './services/base.service';

// DTOs
export {
  PaginatedQueryDto,
  BaseFilterDto,
  PaginatedResponseDto,
  ApiResponseDto,
  BulkOperationResultDto,
} from './dto/base.dto';

// Common Module
export { CommonModule } from './common.module';
