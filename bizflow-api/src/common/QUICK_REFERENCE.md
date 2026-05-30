# Quick Reference Guide: Using Base Architecture

## Creating a New Module with Base Classes

### Step 1: Create Schema

```typescript
// src/posts/schemas/post.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseDocument, DocumentStatus } from '../../common/schemas/base.schema';

export type PostDocument = Post & Document;

@Schema({ timestamps: true })
export class Post extends BaseDocument {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  authorId: Types.ObjectId;

  @Prop({ enum: DocumentStatus, default: DocumentStatus.ACTIVE })
  status: DocumentStatus;

  // Inherits: createdAt, updatedAt, isDeleted, deletedAt, createdBy, updatedBy, metadata
}

export const PostSchema = SchemaFactory.createForClass(Post);

// Add custom indexes
PostSchema.index({ organizationId: 1, status: 1 });
PostSchema.index({ authorId: 1, createdAt: -1 });
```

### Step 2: Create Repository

```typescript
// src/posts/repositories/posts.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from '../schemas/post.schema';
import { BaseRepository } from '../../common/repositories/base.repository';

@Injectable()
export class PostsRepository extends BaseRepository<PostDocument> {
  constructor(@InjectModel(Post.name) model: Model<PostDocument>) {
    super(model);
  }

  // Custom queries
  async findByOrganization(organizationId: string, page = 1, limit = 10) {
    return this.findAllPaginated({ organizationId }, page, limit);
  }

  async findByAuthor(authorId: string) {
    return this.find({ authorId });
  }

  async findByStatus(status: string, organizationId: string) {
    return this.find({ organizationId, status });
  }
}
```

### Step 3: Create Service

```typescript
// src/posts/services/posts.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { BaseService } from '../../common/services/base.service';
import { PostDocument } from '../schemas/post.schema';
import { PostsRepository } from '../repositories/posts.repository';
import { CreatePostDto, UpdatePostDto } from '../dto/post.dto';

@Injectable()
export class PostsService extends BaseService<PostDocument> {
  constructor(private postsRepository: PostsRepository) {
    super(postsRepository);
  }

  // Inherited from BaseService: create, getAll, getById, update, delete, etc.

  // Custom business logic
  async createPost(createDto: CreatePostDto, organizationId: string, authorId: string, userId: string) {
    const data = {
      ...createDto,
      organizationId,
      authorId,
    };
    return this.repository.create(data, userId);
  }

  async getOrgPosts(organizationId: string, page = 1, limit = 10) {
    return this.postsRepository.findByOrganization(organizationId, page, limit);
  }

  async getAuthorPosts(authorId: string) {
    const posts = await this.postsRepository.findByAuthor(authorId);
    return posts;
  }
}
```

### Step 4: Create DTOs

```typescript
// src/posts/dto/post.dto.ts
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { BaseFilterDto } from '../../common/dto/base.dto';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}

export class UpdatePostDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;
}

export class PostFilterDto extends BaseFilterDto {
  @IsOptional()
  @IsString()
  authorId?: string;
}
```

### Step 5: Create Controller

```typescript
// src/posts/controllers/posts.controller.ts
import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { PostsService } from '../services/posts.service';
import { CreatePostDto, UpdatePostDto, PostFilterDto } from '../dto/post.dto';
import { PaginatedQueryDto } from '../../common/dto/base.dto';
import { GetCurrentUserId } from '../../common/decorators/get-current-user.decorator'; // Example

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Post()
  async create(
    @Body() createDto: CreatePostDto,
    @GetCurrentUserId() userId: string,
  ) {
    return this.postsService.createPost(createDto, 'orgId', userId, userId);
  }

  @Get()
  async getAll(@Query() query: PaginatedQueryDto) {
    return this.postsService.getAllPaginated({}, query.page || 1, query.limit || 10);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.postsService.getById(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePostDto,
    @GetCurrentUserId() userId: string,
  ) {
    return this.postsService.update(id, updateDto, userId);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @GetCurrentUserId() userId: string,
  ) {
    return this.postsService.delete(id, userId);
  }
}
```

### Step 6: Create Module

```typescript
// src/posts/posts.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './schemas/post.schema';
import { PostsRepository } from './repositories/posts.repository';
import { PostsService } from './services/posts.service';
import { PostsController } from './controllers/posts.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
  ],
  providers: [PostsRepository, PostsService],
  controllers: [PostsController],
  exports: [PostsService],
})
export class PostsModule {}
```

## Available BaseRepository Methods

```typescript
// Create
await repository.create(createDto, userId);
await repository.createMany(createDtos, userId);

// Read
await repository.findAll(filter);
await repository.findAllPaginated(filter, page, limit);
await repository.findById(id);
await repository.findOne(filter);
await repository.find(filter);
await repository.count(filter);
await repository.exists(filter);

// Update
await repository.updateById(id, updateDto, userId);
await repository.updateMany(filter, updateDto, userId);
await repository.replace(filter, replacement, userId);

// Delete
await repository.softDelete(id, userId);
await repository.softDeleteMany(filter, userId);
await repository.hardDelete(id);
await repository.restore(id, userId);

// Advanced
await repository.bulkWrite(operations);
await repository.aggregate(pipeline);
await repository.distinct(field, filter);
```

## Available BaseService Methods

```typescript
// Create
await service.create(createDto, userId);
await service.createMany(createDtos, userId);

// Read
await service.getAll(filter);
await service.getAllPaginated(filter, page, limit);
await service.getById(id); // Throws 404 if not found
await service.getByFilter(filter); // Throws 404 if not found
await service.find(filter);
await service.count(filter);

// Update
await service.update(id, updateDto, userId); // Throws 404 if not found
await service.updateMany(filter, updateDto, userId);

// Delete
await service.delete(id, userId); // Soft delete
await service.deleteMany(filter, userId);
await service.restore(id, userId);

// Validation
await service.exists(filter);
await service.validateExists(filter, 'Custom error message');
```

## Common Patterns

### Pagination Response

```typescript
async getPosts(query: PaginatedQueryDto) {
  const result = await this.service.getAllPaginated(
    { organizationId },
    query.page || 1,
    query.limit || 10,
  );

  return new PaginatedResponseDto(
    result.data,
    result.total,
    result.page,
    result.limit,
  );
}
```

### Error Handling (Automatic)

```typescript
// Service automatically handles:
// - 404 Not Found (getById, update, delete if not found)
// - 409 Conflict (duplicate unique fields)
// - 400 Bad Request (validation errors)

try {
  await service.getById('nonexistent');
} catch (e) {
  // e is NotFoundException with 404 status
}
```

### Custom Query in Repository

```typescript
async findActiveByOrganization(orgId: string) {
  return this.find({
    organizationId: orgId,
    status: 'active',
  }); // isDeleted: false is automatic
}
```

### Audit Trail

```typescript
// Every operation automatically tracks:
const post = await service.getById(postId);

console.log(post.createdAt);   // When created
console.log(post.createdBy);   // Who created it
console.log(post.updatedAt);   // Last update time
console.log(post.updatedBy);   // Who updated it
console.log(post.isDeleted);   // Soft delete flag
```

### Soft Delete vs Hard Delete

```typescript
// Soft delete (preserves data, marks as deleted)
await service.delete(postId, userId); // Returns deleted document

// Later, restore if needed
await service.restore(postId, userId);

// Hard delete (permanent, rarely used)
await repository.hardDelete(postId);
```

## Performance Tips

1. **Always use pagination** for large datasets
2. **Add indexes** for frequently queried fields
3. **Use custom queries** for complex filters
4. **Lean queries** are default (no Mongoose overhead)
5. **Aggregate** for complex data transformations

## Security Tips

1. **Audit trail** tracks all changes (createdBy, updatedBy)
2. **Soft delete** preserves data for compliance
3. **Always pass userId** to track who made changes
4. **Validate** before update (custom service logic)
5. **Sanitize responses** (remove passwords, tokens)

## Module Dependencies

Each module needs:
- Schema extending `BaseDocument`
- Repository extending `BaseRepository<T>`
- Service extending `BaseService<T>`
- Controller using service methods
- Module configuration with Mongoose

## Minimal Setup

```typescript
// Minimal setup (just using base classes)
export class ItemService extends BaseService<ItemDocument> {
  constructor(repo: ItemRepository) {
    super(repo);
  }
  // Instantly has 25+ methods!
}
```

All CRUD operations are inherited and ready to use!
