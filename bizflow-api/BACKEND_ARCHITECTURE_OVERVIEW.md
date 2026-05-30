# BizFlow Backend Architecture - Complete Overview

## Project Structure

```
bizflow-api/
├── src/
│   ├── common/                          ← Shared base classes
│   │   ├── schemas/
│   │   │   └── base.schema.ts          ← BaseDocument for all entities
│   │   ├── repositories/
│   │   │   └── base.repository.ts      ← Generic CRUD operations (40+ methods)
│   │   ├── services/
│   │   │   └── base.service.ts         ← Business logic layer with error handling
│   │   ├── dto/
│   │   │   └── base.dto.ts             ← DTOs (Pagination, Response, Filter)
│   │   ├── decorators/                 ← Custom decorators
│   │   ├── guards/                     ← Auth guards, permission guards
│   │   ├── interceptors/               ← Global interceptors
│   │   ├── filters/                    ← Exception filters
│   │   ├── BASE_ARCHITECTURE.md        ← Comprehensive documentation
│   │   ├── QUICK_REFERENCE.md          ← Quick usage guide
│   │   ├── index.ts                    ← Central exports
│   │   └── common.module.ts
│   │
│   ├── auth/                            ← Authentication module
│   │   ├── schemas/
│   │   ├── dto/
│   │   ├── services/
│   │   │   └── auth.service.ts         ← Login, register, refresh tokens
│   │   ├── controllers/
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts         ← JWT strategy for Passport
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts       ← JWT guard for protected routes
│   │   └── auth.module.ts
│   │
│   ├── users/                           ← Users module (EXTENDS base)
│   │   ├── schemas/
│   │   │   └── user.schema.ts          ← Extends BaseDocument
│   │   ├── dto/
│   │   │   └── user.dto.ts             ← CreateUserDto, UpdateUserDto
│   │   ├── repositories/
│   │   │   └── users.repository.ts     ← Extends BaseRepository<UserDocument>
│   │   ├── services/
│   │   │   └── users.service.ts        ← Extends BaseService<UserDocument>
│   │   ├── controllers/
│   │   │   └── users.controller.ts     ← HTTP endpoints for users
│   │   └── users.module.ts
│   │
│   ├── organizations/                   ← Organizations module (EXTENDS base)
│   │   ├── schemas/
│   │   │   └── organization.schema.ts  ← Extends BaseDocument
│   │   ├── dto/
│   │   ├── repositories/
│   │   │   └── organizations.repository.ts
│   │   ├── services/
│   │   │   └── organizations.service.ts
│   │   ├── controllers/
│   │   └── organizations.module.ts
│   │
│   ├── branches/                        ← Branches module (EXTENDS base)
│   │   ├── schemas/
│   │   │   └── branch.schema.ts        ← Extends BaseDocument
│   │   ├── dto/
│   │   ├── repositories/
│   │   │   └── branches.repository.ts
│   │   ├── services/
│   │   │   └── branches.service.ts
│   │   ├── controllers/
│   │   └── branches.module.ts
│   │
│   ├── app.module.ts                    ← Root module (imports all feature modules)
│   └── main.ts                          ← Application entry point
│
├── test/
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
│
├── package.json                         ← NestJS, MongoDB, Mongoose, JWT, Passport
├── tsconfig.json
├── tsconfig.build.json
├── nest-cli.json
└── README.md
```

## Architecture Layers

### 1. Presentation Layer (Controllers)
- HTTP endpoints
- Request validation
- Response formatting
- Uses: Services

```
GET /users → UsersController.getAll() → UsersService.getAll()
```

### 2. Business Logic Layer (Services)
- Business rules
- Error handling
- Data validation
- Uses: Repositories

```
UsersService extends BaseService<UserDocument>
├── Inherited: create, read, update, delete, validate
└── Custom: createUser, changePassword, etc.
```

### 3. Data Access Layer (Repositories)
- Database queries
- Data transformation
- Uses: Mongoose models

```
UsersRepository extends BaseRepository<UserDocument>
├── Inherited: 40+ CRUD methods
└── Custom: findByEmail, findByRole, etc.
```

### 4. Data Layer (Schemas)
- Data structure
- Validation rules
- Database constraints

```
User extends BaseDocument
├── Inherited: timestamps, audit trail, soft delete
└── Custom: email, firstName, lastName, etc.
```

## Data Flow

### Create User Flow
```
POST /api/users {email, firstName, lastName}
       ↓
UsersController.create()
       ↓
UsersService.create()              [Error handling]
       ↓
UsersRepository.create()           [Database operation]
       ↓
MongoDB (inserted with: createdAt, createdBy, metadata)
       ↓
Response {id, email, firstName, ...}
```

### Get Users Flow
```
GET /api/users?page=1&limit=10
       ↓
UsersController.getAll()
       ↓
UsersService.getAllPaginated()     [Error handling]
       ↓
UsersRepository.findAllPaginated() [Lean query, exclude deleted]
       ↓
MongoDB (select * where isDeleted = false)
       ↓
Response {data: [...], total, page, limit, totalPages, hasMore}
```

### Update User Flow
```
PUT /api/users/123 {firstName: "New"}
       ↓
UsersController.update()
       ↓
UsersService.update()              [Validation, error handling]
       ↓
UsersRepository.updateById()       [Database operation]
       ↓
MongoDB (updated: updatedAt, updatedBy set)
       ↓
Response {id, email, firstName: "New", updatedAt, ...}
```

### Delete User Flow
```
DELETE /api/users/123
       ↓
UsersController.delete()
       ↓
UsersService.delete()              [Soft delete]
       ↓
UsersRepository.softDelete()       [Mark isDeleted=true]
       ↓
MongoDB (isDeleted: true, deletedAt: now)
       ↓
Response {id, email, ..., isDeleted: true}
```

## Database Schema Evolution

### MongoDB Collection Structure

#### User Document
```json
{
  "_id": ObjectId,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "password": "hashed_password",
  "organizationId": ObjectId,
  "branchId": ObjectId,
  "role": "admin",
  "status": "active",
  
  // From BaseDocument:
  "createdAt": Date,
  "updatedAt": Date,
  "isDeleted": false,
  "deletedAt": null,
  "createdBy": ObjectId,
  "updatedBy": ObjectId,
  "metadata": {},
  "__v": 0
}
```

#### Organization Document
```json
{
  "_id": ObjectId,
  "name": "Company Name",
  "code": "COMP001",
  "email": "org@example.com",
  "ownerId": ObjectId,
  "members": [ObjectId, ObjectId, ...],
  "plan": "premium",
  "status": "active",
  
  // From BaseDocument:
  "createdAt": Date,
  "updatedAt": Date,
  "isDeleted": false,
  "deletedAt": null,
  "createdBy": ObjectId,
  "updatedBy": ObjectId,
  "metadata": {}
}
```

#### Branch Document
```json
{
  "_id": ObjectId,
  "name": "Branch Name",
  "code": "BR001",
  "organizationId": ObjectId,
  "managers": [ObjectId, ObjectId, ...],
  "status": "active",
  
  // From BaseDocument:
  "createdAt": Date,
  "updatedAt": Date,
  "isDeleted": false,
  "deletedAt": null,
  "createdBy": ObjectId,
  "updatedBy": ObjectId,
  "metadata": {}
}
```

## Module Relationships

```
common/                 [No dependencies]
    ↓
auth/                   [Uses: common for base classes]
    ↓
users/                  [Uses: auth, common]
    ↓
organizations/          [Uses: users, auth, common]
    ↓
branches/               [Uses: organizations, users, auth, common]
    ↓
[Other feature modules] [Use: various above modules]
```

## File Responsibilities

| File | Responsibility | Extends/Implements |
|------|-----------------|-------------------|
| BaseDocument | Define common schema fields | None |
| BaseRepository | CRUD operations, queries | None |
| BaseService | Business logic, error handling | None |
| UserSchema | User data structure | BaseDocument |
| UsersRepository | User-specific queries | BaseRepository |
| UsersService | User business logic | BaseService |
| UsersController | HTTP endpoints | None (uses service) |

## Error Handling Flow

```
UsersController.create()
       ↓
UsersService.create()
       ├─ Duplicate email → throw ConflictException (409)
       ├─ Validation error → throw BadRequestException (400)
       └─ Database error → throw InternalServerErrorException (500)
       ↓
Response {success: false, error: "message"}
```

## Key Advantages

1. **Code Reuse**: 40+ inherited methods per module
2. **Consistency**: All modules follow same pattern
3. **Performance**: Lean queries, proper indexes
4. **Security**: Audit trail, soft delete, optimistic locking
5. **Maintainability**: Single source of truth (base classes)
6. **Scalability**: Easy to add new modules
7. **Testing**: Base classes can be mocked/tested once
8. **Documentation**: Clear patterns and conventions

## Extension Points

### Adding Custom Repository Method
```typescript
class ItemRepository extends BaseRepository {
  async findByCategory(category: string) {
    return this.find({ category });
  }
}
```

### Adding Custom Service Logic
```typescript
class ItemService extends BaseService {
  async createAndNotify(createDto, userId) {
    const item = await this.create(createDto, userId);
    await this.notify(item);
    return item;
  }
}
```

### Adding Custom Query Operation
```typescript
const stats = await repository.aggregate([
  { $match: { organizationId } },
  { $group: { _id: '$category', count: { $sum: 1 } } }
]);
```

## Deployment Considerations

- All base classes are in `common/` for easy updates
- No code duplication across modules
- Single database (MongoDB) configuration
- JWT tokens handled in auth module
- All modules independently testable
- Performance optimized with lean queries and indexes

## Summary

The architecture provides:
- ✅ **Modular design**: Each module is self-contained
- ✅ **Inheritance hierarchy**: Code reuse at every level
- ✅ **Server-side validation**: Business logic on backend
- ✅ **Audit trail**: Track all changes
- ✅ **Soft delete**: Data preservation
- ✅ **Error handling**: Automatic and consistent
- ✅ **Pagination**: Built-in for all queries
- ✅ **Extensibility**: Easy to add custom logic

This is a production-ready, scalable, and maintainable architecture!
