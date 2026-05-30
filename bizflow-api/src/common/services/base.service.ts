import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BaseRepository } from '../repositories/base.repository';
import { BaseDocument } from '../schemas/base.schema';
import { Document } from 'mongoose';

// Type alias for filter queries
type Filter<T> = Record<string, any>;

/**
 * Base Service
 * Provides common business logic and error handling
 * All services should extend this class
 */
export abstract class BaseService<T extends BaseDocument & Document> {
  constructor(protected readonly repository: BaseRepository<T>) {}

  /**
   * Create new document with error handling
   */
  async create(createDto: Partial<T>, userId?: string): Promise<T> {
    try {
      return await this.repository.create(createDto, userId);
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new BadRequestException(`${field} already exists`);
      }
      throw error;
    }
  }

  /**
   * Create multiple documents
   */
  async createMany(createDtos: Partial<T>[], userId?: string): Promise<T[]> {
    try {
      return await this.repository.createMany(createDtos, userId);
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new BadRequestException(`${field} already exists`);
      }
      throw error;
    }
  }

  /**
   * Get all documents
   */
  async getAll(filter: Filter<T> = {}): Promise<T[]> {
    return this.repository.findAll(filter);
  }

  /**
   * Get all documents with pagination
   */
  async getAllPaginated(
    filter: Filter<T> = {},
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: T[]; total: number; page: number; limit: number }> {
    return this.repository.findAllPaginated(filter, page, limit);
  }

  /**
   * Get document by ID with error handling
   */
  async getById(id: string): Promise<T> {
    const document = await this.repository.findById(id);
    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
    return document;
  }

  /**
   * Get document by filter
   */
  async getByFilter(filter: Filter<T>): Promise<T> {
    const document = await this.repository.findOne(filter);
    if (!document) {
      throw new NotFoundException('Document not found');
    }
    return document;
  }

  /**
   * Find documents by filter
   */
  async find(filter: Filter<T>): Promise<T[]> {
    return this.repository.find(filter);
  }

  /**
   * Count documents
   */
  async count(filter: Filter<T> = {}): Promise<number> {
    return this.repository.count(filter);
  }

  /**
   * Update document with error handling
   */
  async update(
    id: string,
    updateDto: Partial<T>,
    userId?: string,
  ): Promise<T> {
    try {
      const document = await this.repository.updateById(id, updateDto, userId);
      if (!document) {
        throw new NotFoundException(`Document with ID ${id} not found`);
      }
      return document;
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new BadRequestException(`${field} already exists`);
      }
      throw error;
    }
  }

  /**
   * Update many documents
   */
  async updateMany(
    filter: Filter<T>,
    updateDto: Partial<T>,
    userId?: string,
  ): Promise<{ modifiedCount: number }> {
    return this.repository.updateMany(filter, updateDto, userId);
  }

  /**
   * Delete document (soft delete)
   */
  async delete(id: string, userId?: string): Promise<T> {
    const document = await this.repository.softDelete(id, userId);
    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
    return document;
  }

  /**
   * Delete many documents (soft delete)
   */
  async deleteMany(
    filter: Filter<T>,
    userId?: string,
  ): Promise<{ modifiedCount: number }> {
    return this.repository.softDeleteMany(filter, userId);
  }

  /**
   * Restore soft deleted document
   */
  async restore(id: string, userId?: string): Promise<T> {
    const document = await this.repository.restore(id, userId);
    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
    return document;
  }

  /**
   * Check if document exists
   */
  async exists(filter: Filter<T>): Promise<boolean> {
    return this.repository.exists(filter);
  }

  /**
   * Validate document exists and throw error if not
   */
  async validateExists(
    filter: Filter<T>,
    errorMessage: string = 'Document not found',
  ): Promise<void> {
    const exists = await this.repository.exists(filter);
    if (!exists) {
      throw new NotFoundException(errorMessage);
    }
  }

  /**
   * Get repository for advanced operations
   */
  protected getRepository(): BaseRepository<T> {
    return this.repository;
  }
}
