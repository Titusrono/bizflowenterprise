# Base Architecture Documentation

## Overview

The BizFlow Enterprise backend uses a **server-side heavy architecture** with comprehensive base classes, repositories, and services to minimize code repetition and ensure consistency across all modules.

## Architecture Layers

### 1. Base Schema (`BaseDocument`)

Located in: `src/common/schemas/base.schema.ts`

All domain documents extend the `BaseDocument` class which provides:

- **`_id`**: MongoDB ObjectId (auto-generated)
- **`createdAt`**: Timestamp when document was created
- **`updatedAt`**: Timestamp when document was last updated
- **`isDeleted`**: Soft delete flag (boolean)
- **`deletedAt`**: Timestamp when document was deleted
- **`createdBy`**: User ID who created the document (audit trail)
- **`updatedBy`**: User ID who last updated the document (audit trail)
- **`metadata`**: Custom object for extensibility
- **`__v`**: Version field for optimistic locking

#### Status Fields
The `StatusFields` class provides:
- **`status`**: Enum (active, inactive, pending, archived, suspended)
- **`statusReason`**: Reason for current status
- **`statusChangedAt`**: When status was changed

#### Example: User Schema Extension
```typescript
@Schema({ timestamps: true })
export class User extends BaseDocument {
  @Prop({ required: true, unique: true })
  email: string;
  
  // ... other fields
}
```

### 2. Base Repository (`BaseRepository<T>`)

Located in: `src/common/repositories/base.repository.ts`

Provides all common CRUD operations:

#### Create Operations
- `create(createDto, userId?)` - Create single document
- `createMany(createDtos[], userId?)` - Batch create

#### Read Operations
- `findAll(filter?)` - Get all documents (auto-excludes soft deleted)
- `findAllPaginated(filter, page, limit)` - With pagination
- `findById(id)` - Get by ID
- `findOne(filter)` - Get one by filter
- `find(filter)` - Get many by filter
- `count(filter?)` - Count documents
- `distinct(field, filter?)` - Get distinct values

#### Update Operations
- `updateById(id, updateDto, userId?)` - Update by ID
- `updateMany(filter, updateDto, userId?)` - Batch update
- `replace(filter, replacement, userId?)` - Replace document

#### Delete Operations
- `softDelete(id, userId?)` - Mark as deleted (preserves data)
- `softDeleteMany(filter, userId?)` - Batch soft delete
- `restore(id, userId?)` - Restore soft deleted document
- `hardDelete(id)` - Permanently delete

#### Helper Operations
- `exists(filter)` - Check if document exists
- `countAll(filter?)` - Count including deleted
- `bulkWrite(operations)` - Bulk operations
- `aggregate(pipeline)` - Aggregation pipeline

#### Features
- Automatic timestamp management (createdAt, updatedAt)
- Automatic audit trail (createdBy, updatedBy)
- Soft delete support (preserves historical data)
- Automatic filtering of deleted documents in reads
- Lean queries by default (better performance)

### 3. Base Service (`BaseService<T>`)

Located in: `src/common/services/base.service.ts`

Provides business logic layer with error handling:

#### Standard Operations
- `create(createDto, userId?)` - Create with validation
- `createMany(createDtos[], userId?)` - Batch create
- `getAll(filter?)` - Get all
- `getAllPaginated(filter, page, limit)` - Paginated retrieval
- `getById(id)` - Get by ID (throws 404 if not found)
- `getByFilter(filter)` - Get by filter (throws 404 if not found)
- `find(filter)` - Find many
- `count(filter?)` - Count
- `update(id, updateDto, userId?)` - Update with validation
- `updateMany(filter, updateDto, userId?)` - Batch update
- `delete(id, userId?)` - Soft delete
- `deleteMany(filter, userId?)` - Batch soft delete
- `restore(id, userId?)` - Restore deleted

#### Validation Operations
- `exists(filter)` - Check existence
- `validateExists(filter, errorMessage?)` - Throw if not exists

#### Features
- Automatic error handling for duplicate keys (409 Conflict)
- NotFoundException for missing documents (404)
- BadRequestException for validation errors (400)
- Access to repository for advanced operations
- Extensible for custom business logic

### 4. Common DTOs

Located in: `src/common/dto/base.dto.ts`

#### `PaginatedQueryDto`
For query parameters on endpoints:
```typescript
{
  page?: number;      // Default: 1
  limit?: number;     // Default: 10, Max: 100
  sortBy?: string;    // Field name
  sortOrder?: 'asc' | 'desc'; // Default: 'desc'
}
```

#### `BaseFilterDto`
For common filters:
```typescript
{
  search?: string;
  status?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  updatedAfter?: Date;
  updatedBefore?: Date;
}
```

#### `PaginatedResponseDto<T>`
Standard paginated response:
```typescript
{
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}
```

#### `ApiResponseDto<T>`
Standard API response:
```typescript
{
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}
```

## Module Structure

### Standard Module Setup

Each feature module follows this structure:

```
src/
├── feature/
│   ├── schemas/
│   │   └── feature.schema.ts          (Extends BaseDocument)
│   ├── dto/
│   │   └── feature.dto.ts             (Extends/uses BaseFilterDto, etc)
│   ├── repositories/
│   │   └── feature.repository.ts      (Extends BaseRepository)
│   ├── services/
│   │   └── feature.service.ts         (Extends BaseService)
│   ├── controllers/
│   │   └── feature.controller.ts
│   └── feature.module.ts
```

### Example: User Module

#### 1. Schema (User extends BaseDocument)
```typescript
@Schema({ timestamps: true })
export class User extends BaseDocument {
  @Prop({ unique: true })
  email: string;
  // ... other fields
}
```

#### 2. Repository (UsersRepository extends BaseRepository)
```typescript
@Injectable()
export class UsersRepository extends BaseRepository<UserDocument> {
  constructor(@InjectModel(User.name) model: Model<UserDocument>) {
    super(model);
  }

  // Custom queries
  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.model.findOne({ email, isDeleted: false }).lean().exec();
  }
}
```

#### 3. Service (UsersService extends BaseService)
```typescript
@Injectable()
export class UsersService extends BaseService<UserDocument> {
  constructor(private repo: UsersRepository) {
    super(repo);
  }

  // Custom business logic
  async createUser(createDto: CreateUserDto, userId: string) {
    // Hashing, validation, etc.
    return this.repository.create(userData, userId);
  }
}
```

#### 4. Controller
```typescript
@Controller('users')
export class UsersController {
  constructor(private service: UsersService) {}

  @Post()
  async create(@Body() createDto: CreateUserDto) {
    return this.service.createUser(createDto, userId);
  }

  @Get()
  async getAll(@Query() query: PaginatedQueryDto) {
    return this.service.getAllPaginated({}, query.page, query.limit);
  }
}
```

## Inheritance Hierarchy

```
BaseDocument (schema base)
    ↓
User, Organization, Branch (domain documents)

BaseRepository<T> (CRUD operations)
    ↓
UsersRepository, OrganizationsRepository, BranchesRepository

BaseService<T> (business logic + error handling)
    ↓
UsersService, OrganizationsService, BranchesService
```

## Key Features

### Soft Delete Support
All entities support soft delete (instead of permanent deletion):
- `isDeleted: true` marks document as deleted
- `deletedAt` stores when it was deleted
- All queries automatically exclude soft-deleted documents
- `restore()` can recover deleted documents
- `hardDelete()` permanently removes if needed

### Audit Trail
Every create and update operation is tracked:
- `createdBy`: User who created
- `updatedBy`: User who last updated
- `createdAt`: When created
- `updatedAt`: When last updated

### Pagination
Built-in pagination support:
- Configurable page and limit
- Returns total count
- Automatic page calculation
- `hasMore` flag for frontend

### Error Handling
Automatic error handling in services:
- **409 Conflict**: Duplicate key (email, code, etc.)
- **404 Not Found**: Document not found
- **400 Bad Request**: Validation errors

### Performance
- Lean queries by default (faster, less memory)
- Proper indexing on common fields
- Aggregation pipeline support
- Bulk operations support

## Usage Guidelines

### When Adding a New Module

1. Create schema extending `BaseDocument`
2. Create repository extending `BaseRepository<T>`
3. Create service extending `BaseService<T>`
4. Add custom queries/logic as needed in repository/service
5. Create controller using service methods

### Queries Across Modules

All modules have consistent query patterns:

```typescript
// Get all with filter
await service.getAll({ organizationId });

// Get paginated
await service.getAllPaginated({ organizationId }, 1, 10);

// Get by ID
await service.getById(userId);

// Create
await service.create(createDto, userId);

// Update
await service.update(id, updateDto, userId);

// Delete (soft)
await service.delete(id, userId);

// Check existence
const exists = await service.exists({ email });
```

### Custom Queries

Add custom queries in repository:

```typescript
async findByOrganization(orgId: string) {
  return this.find({ organizationId: orgId });
}

// Use in service
async getOrgUsers(orgId: string) {
  return this.repository.findByOrganization(orgId);
}
```

## Migration From Existing Code

If you have existing modules without base classes:

1. Update schema to extend `BaseDocument`
2. Create repository extending `BaseRepository`
3. Create service extending `BaseService`
4. Update module to inject repository and service
5. Remove duplicate CRUD code
6. Add module-specific logic

## Performance Considerations

- Base repository uses `.lean()` for read queries (no overhead)
- Indexes are automatically added to common query fields
- Soft deletes are efficient (just boolean flag)
- Pagination prevents memory overload
- Aggregation available for complex queries

## Security Considerations

- Audit trail (createdBy, updatedBy) tracks all changes
- Soft delete preserves data for compliance
- Optimistic locking via `__v` field
- Password fields should be excluded from responses
- Sensitive fields can be removed using `sanitize()` methods

## File Organization

```
src/common/
├── schemas/
│   └── base.schema.ts                 (BaseDocument, DocumentStatus)
├── repositories/
│   └── base.repository.ts             (BaseRepository<T>)
├── services/
│   └── base.service.ts                (BaseService<T>)
├── dto/
│   └── base.dto.ts                    (Pagination, Response DTOs)
├── index.ts                           (Central exports)
└── common.module.ts                   (Module definition)
```

## Extending BaseDocument

```typescript
@Schema({ timestamps: true })
export class MyDocument extends BaseDocument {
  @Prop({ required: true })
  name: string;

  // Inherits:
  // - createdAt, updatedAt
  // - isDeleted, deletedAt
  // - createdBy, updatedBy
  // - metadata, __v
}
```

## Summary

This base architecture provides:
- ✅ Minimal code repetition
- ✅ Consistent patterns across modules
- ✅ Built-in CRUD operations
- ✅ Error handling and validation
- ✅ Audit trail and soft delete support
- ✅ Pagination and filtering
- ✅ Server-side heavy approach
- ✅ Easy to extend and customize
