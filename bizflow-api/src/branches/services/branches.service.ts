import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { BaseService } from '../../common/services/base.service';
import { BranchDocument } from '../schemas/branch.schema';
import { BranchesRepository } from '../repositories/branches.repository';
import { CreateBranchDto, UpdateBranchDto } from '../dto/branch.dto';

/**
 * Branches Service
 * Extends BaseService with Branch-specific business logic
 * Handles branch management, manager assignment, and regional operations
 */
@Injectable()
export class BranchesService extends BaseService<BranchDocument> {
  constructor(
    private readonly branchesRepository: BranchesRepository,
  ) {
    super(branchesRepository);
  }

  /**
   * Create branch
   */
  async createBranch(
    createDto: CreateBranchDto,
    organizationId: string,
    userId: string,
  ): Promise<BranchDocument> {
    if (!organizationId) {
      throw new BadRequestException('organizationId is required to create a branch');
    }
    // Check if code already exists in this organization
    const existingCode = await this.branchesRepository.findByCode(
      createDto.code,
      organizationId,
    );
    if (existingCode) {
      throw new ConflictException(
        'Branch code already exists in this organization',
      );
    }

    const branchData = {
      ...createDto,
      organizationId: new Types.ObjectId(organizationId),
      code: createDto.code.toUpperCase(),
    };

    // Defensive: ensure we don't pass an explicit _id value from the client
    if ((branchData as any)._id !== undefined) {
      delete (branchData as any)._id;
    }

    // Log for debugging when running locally — helps diagnose "document must have an _id" issues
    // eslint-disable-next-line no-console
    console.log('[BranchesService] creating branch:', { branchData });

    return this.repository.create(branchData, userId);
  }

  /**
   * Get branches by organization
   */
  async getBranchesByOrganization(
    organizationId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    return this.branchesRepository.findByOrganization(
      organizationId,
      page,
      limit,
    );
  }

  /**
   * Get branch by code
   */
  async getByCode(code: string, organizationId: string): Promise<BranchDocument> {
    const branch = await this.branchesRepository.findByCode(code, organizationId);
    if (!branch) {
      throw new BadRequestException('Branch not found');
    }
    return branch;
  }

  /**
   * Get active branches
   */
  async getActiveBranches(organizationId: string) {
    return this.branchesRepository.findActiveByOrganization(organizationId);
  }

  /**
   * Count branches in organization
   */
  async countBranches(organizationId: string): Promise<number> {
    return this.branchesRepository.countByOrganization(organizationId);
  }

  /**
   * Count active branches
   */
  async countActiveBranches(organizationId: string): Promise<number> {
    return this.branchesRepository.countActiveByOrganization(organizationId);
  }

  /**
   * Add manager to branch
   */
  async addManager(
    branchId: string,
    managerId: string,
    currentUserId: string,
  ): Promise<any> {
    const branch = await this.repository.findById(branchId);
    if (!branch) {
      throw new BadRequestException('Branch not found');
    }

    const managerObjectId = new Types.ObjectId(managerId);
    if (branch.managers?.some((id) => id.toString() === managerObjectId.toString())) {
      throw new ConflictException('Manager already assigned to this branch');
    }

    return this.branchesRepository.addManager(branchId, managerId);
  }

  /**
   * Remove manager from branch
   */
  async removeManager(
    branchId: string,
    managerId: string,
    currentUserId: string,
  ): Promise<any> {
    const branch = await this.repository.findById(branchId);
    if (!branch) {
      throw new BadRequestException('Branch not found');
    }

    const managerObjectId = new Types.ObjectId(managerId);
    if (!branch.managers?.some((id) => id.toString() === managerObjectId.toString())) {
      throw new BadRequestException('Manager not assigned to this branch');
    }

    return this.branchesRepository.removeManager(branchId, managerId);
  }

  /**
   * Update branch
   */
  async updateBranch(
    branchId: string,
    updateDto: UpdateBranchDto,
    currentUserId: string,
  ): Promise<any> {
    // Check if trying to change code
    const branch = await this.repository.findById(branchId);
    if (!branch) {
      throw new BadRequestException('Branch not found');
    }

    if (updateDto.code) {
      const existingCode = await this.branchesRepository.findByCode(
        updateDto.code,
        branch.organizationId.toString(),
      );
      if (existingCode && existingCode._id.toString() !== branchId) {
        throw new ConflictException('Branch code already exists');
      }
    }

    return this.repository.updateById(branchId, updateDto, currentUserId);
  }

  /**
   * Soft delete branch
   */
  async softDelete(branchId: string, currentUserId?: string): Promise<any> {
    return this.delete(branchId, currentUserId);
  }

  /**
   * Get branches by manager
   */
  async getBranchesByManager(managerId: string) {
    return this.branchesRepository.findByManager(managerId);
  }

  /**
   * Get branches by region
   */
  async getBranchesByRegion(region: string, organizationId: string) {
    return this.branchesRepository.findByRegion(region, organizationId);
  }

  /**
   * Get branches by country
   */
  async getBranchesByCountry(country: string, organizationId: string) {
    return this.branchesRepository.findByCountry(country, organizationId);
  }

  /**
   * Get branch statistics for organization
   */
  async getOrganizationStats(organizationId: string) {
    return this.branchesRepository.getOrganizationStats(organizationId);
  }

  /**
   * Get branches by headcount range
   */
  async getBranchesByHeadcountRange(
    organizationId: string,
    minHeadcount: number,
    maxHeadcount: number,
  ) {
    return this.branchesRepository.findByHeadcountRange(
      organizationId,
      minHeadcount,
      maxHeadcount,
    );
  }
}
