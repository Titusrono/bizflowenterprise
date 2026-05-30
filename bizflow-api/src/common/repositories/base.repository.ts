import { Injectable } from '@nestjs/common';
import { Model, Document, UpdateQuery, QueryOptions } from 'mongoose';
import { BaseDocument } from '../schemas/base.schema';

// Type alias for filter queries to work with mongoose v9+
type Filter<T> = Record<string, any>;

/**
 * Base Repository
 * Provides common CRUD operations for all repositories
 * Handles soft delete, timestamps, and other common operations
 */
@Injectable()
export class BaseRepository<T extends BaseDocument & Document> {
  constructor(protected readonly model: Model<T>) {}

  /**
   * Create a new document
   */
  async create(createDto: Partial<T>, userId?: string): Promise<T> {
    const payload = {
      ...createDto,
      createdBy: userId,
      createdAt: new Date(),
    };

    // Use Model.create() which delegates to the driver and usually ensures _id generation.
    // However some edge-cases with schema inheritance or decorated base classes have been
    // observed to surface "document must have an _id before saving" errors. To be robust
    // attempt create(), and fall back to a direct collection insert if create() fails.
    try {
      const created = await this.model.create(payload);
      return (created.toObject ? created.toObject() : created) as any as T;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[BaseRepository] model.create failed, falling back to collection.insertOne', err?.message || err);
      // fallback: insert raw document via native driver and return the inserted doc
      const result = await this.model.collection.insertOne(payload as any);
      const insertedId = result.insertedId;
      const doc = await (this.model.findById(insertedId).lean().exec() as any) as T | null;
      if (!doc) throw err;
      return doc;
    }
  }

  /**
   * Create multiple documents
   */
  async createMany(createDtos: Partial<T>[], userId?: string): Promise<T[]> {
    const docs = createDtos.map((dto) => ({
      ...dto,
      createdBy: userId,
      createdAt: new Date(),
    }));
    return this.model.insertMany(docs) as any as T[];
  }

  /**
   * Find all documents (excluding soft deleted)
   */
  async findAll(filter: Filter<T> = {}): Promise<T[]> {
    return (this.model
      .find({ ...filter, isDeleted: false })
      .sort({ createdAt: -1 })
      .lean()
      .exec() as any) as T[];
  }

  /**
   * Find all documents with pagination
   */
  async findAllPaginated(
    filter: Filter<T> = {},
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: T[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      (this.model
        .find({ ...filter, isDeleted: false })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean()
        .exec() as any) as T[],
      this.model.countDocuments({ ...filter, isDeleted: false }),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  /**
   * Find a single document by ID
   */
  async findById(id: string): Promise<T | null> {
    return (this.model
      .findOne({ _id: id, isDeleted: false })
      .lean()
      .exec() as any) as T | null;
  }

  /**
   * Find a single document by filter
   */
  async findOne(filter: Filter<T>): Promise<T | null> {
    return (this.model
      .findOne({ ...filter, isDeleted: false })
      .lean()
      .exec() as any) as T | null;
  }

  /**
   * Find documents by filter
   */
  async find(filter: Filter<T>): Promise<T[]> {
    return (this.model
      .find({ ...filter, isDeleted: false })
      .lean()
      .exec() as any) as T[];
  }

  /**
   * Count documents
   */
  async count(filter: Filter<T> = {}): Promise<number> {
    return this.model.countDocuments({ ...filter, isDeleted: false });
  }

  /**
   * Update document by ID
   */
  async updateById(
    id: string,
    updateDto: UpdateQuery<T>,
    userId?: string,
  ): Promise<T | null> {
    const update = {
      ...updateDto,
      updatedBy: userId,
      updatedAt: new Date(),
    };

    return (this.model
      .findByIdAndUpdate(id, update, { new: true })
      .lean()
      .exec() as any) as T | null;
  }

  /**
   * Update documents by filter
   */
  async updateMany(
    filter: Filter<T>,
    updateDto: UpdateQuery<T>,
    userId?: string,
  ): Promise<{ modifiedCount: number }> {
    const update = {
      ...updateDto,
      updatedBy: userId,
      updatedAt: new Date(),
    };

    const result = await this.model.updateMany(
      { ...filter, isDeleted: false },
      update,
    );

    return { modifiedCount: result.modifiedCount };
  }

  /**
   * Replace document
   */
  async replace(
    filter: Filter<T>,
    replacement: Partial<T>,
    userId?: string,
  ): Promise<T | null> {
    return (this.model
      .findOneAndUpdate(
        { ...filter, isDeleted: false },
        { ...replacement, updatedBy: userId, updatedAt: new Date() },
        { new: true },
      )
      .lean()
      .exec() as any) as T | null;
  }

  /**
   * Soft delete - marks document as deleted
   */
  async softDelete(id: string, userId?: string): Promise<T | null> {
    return (this.model
      .findByIdAndUpdate(
        id,
        {
          isDeleted: true,
          deletedAt: new Date(),
          updatedBy: userId,
          updatedAt: new Date(),
        },
        { new: true },
      )
      .lean()
      .exec() as any) as T | null;
  }

  /**
   * Soft delete many documents
   */
  async softDeleteMany(
    filter: Filter<T>,
    userId?: string,
  ): Promise<{ modifiedCount: number }> {
    const result = await this.model.updateMany(
      { ...filter, isDeleted: false },
      {
        isDeleted: true,
        deletedAt: new Date(),
        updatedBy: userId,
        updatedAt: new Date(),
      },
    );

    return { modifiedCount: result.modifiedCount };
  }

  /**
   * Hard delete - permanently removes document
   */
  async hardDelete(id: string): Promise<{ deletedCount: number }> {
    const result = await this.model.deleteOne({ _id: id });
    return { deletedCount: result.deletedCount };
  }

  /**
   * Hard delete many documents
   */
  async hardDeleteMany(
    filter: Filter<T>,
  ): Promise<{ deletedCount: number }> {
    const result = await this.model.deleteMany(filter);
    return { deletedCount: result.deletedCount };
  }

  /**
   * Restore soft deleted document
   */
  async restore(id: string, userId?: string): Promise<T | null> {
    return (this.model
      .findByIdAndUpdate(
        id,
        {
          isDeleted: false,
          deletedAt: null,
          updatedBy: userId,
          updatedAt: new Date(),
        },
        { new: true },
      )
      .lean()
      .exec() as any) as T | null;
  }

  /**
   * Check if document exists
   */
  async exists(filter: Filter<T>): Promise<boolean> {
    const count = await this.model.countDocuments({
      ...filter,
      isDeleted: false,
    });
    return count > 0;
  }

  /**
   * Get total count including deleted documents
   */
  async countAll(filter: Filter<T> = {}): Promise<number> {
    return this.model.countDocuments(filter);
  }

  /**
   * Get model for direct access when needed
   */
  getModel(): Model<T> {
    return this.model;
  }

  /**
   * Perform bulk operations
   */
  async bulkWrite(operations: any[]): Promise<any> {
    return this.model.collection.bulkWrite(operations);
  }

  /**
   * Aggregate pipeline
   */
  async aggregate(pipeline: any[]): Promise<any[]> {
    return this.model.aggregate(pipeline).exec();
  }

  /**
   * Distinct values for a field
   */
  async distinct(field: string, filter: Filter<T> = {}): Promise<any[]> {
    return (this.model
      .distinct(field, { ...filter, isDeleted: false })
      .exec() as any) as any[];
  }
}
