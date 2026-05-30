import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Branch, BranchDocument } from '../schemas/branch.schema';
import { BaseRepository } from '../../common/repositories/base.repository';

/**
 * Branches Repository
 * Extends BaseRepository with Branch-specific queries
 */
@Injectable()
export class BranchesRepository extends BaseRepository<BranchDocument> {
  constructor(
    @InjectModel(Branch.name)
    private readonly branchModel: Model<BranchDocument>,
  ) {
    super(branchModel);
  }

  /**
   * Find branches by organization
   */
  async findByOrganization(organizationId: string, page: number = 1, limit: number = 10) {
    return this.findAllPaginated(
      { organizationId },
      page,
      limit,
    );
  }

  /**
   * Find branch by code within organization
   */
  async findByCode(code: string, organizationId: string): Promise<BranchDocument | null> {
    return this.model
      .findOne({
        code: code.toUpperCase(),
        organizationId,
        isDeleted: false,
      })
      .lean()
      .exec();
  }

  /**
   * Find active branches by organization
   */
  async findActiveByOrganization(organizationId: string) {
    return this.find({
      organizationId,
      status: 'active',
    });
  }

  /**
   * Count branches in organization
   */
  async countByOrganization(organizationId: string): Promise<number> {
    return this.count({ organizationId });
  }

  /**
   * Count active branches in organization
   */
  async countActiveByOrganization(organizationId: string): Promise<number> {
    return this.count({
      organizationId,
      status: 'active',
    });
  }

  /**
   * Find branches by manager
   */
  async findByManager(managerId: string) {
    return this.find({
      managers: managerId,
    });
  }

  /**
   * Add manager to branch
   */
  async addManager(branchId: string, managerId: string): Promise<BranchDocument | null> {
    return this.model
      .findByIdAndUpdate(
        branchId,
        { $addToSet: { managers: managerId } },
        { new: true },
      )
      .lean()
      .exec();
  }

  /**
   * Remove manager from branch
   */
  async removeManager(branchId: string, managerId: string): Promise<BranchDocument | null> {
    return this.model
      .findByIdAndUpdate(
        branchId,
        { $pull: { managers: managerId } },
        { new: true },
      )
      .lean()
      .exec();
  }

  /**
   * Find branches by region
   */
  async findByRegion(region: string, organizationId: string) {
    return this.find({
      organizationId,
      region,
    });
  }

  /**
   * Find branches by country
   */
  async findByCountry(country: string, organizationId: string) {
    return this.find({
      organizationId,
      country,
    });
  }

  /**
   * Get branch statistics for organization
   */
  async getOrganizationStats(organizationId: string) {
    const stats = await this.aggregate([
      {
        $match: {
          organizationId: organizationId,
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    return stats;
  }

  /**
   * Get branches by headcount range
   */
  async findByHeadcountRange(
    organizationId: string,
    minHeadcount: number,
    maxHeadcount: number,
  ) {
    return this.find({
      organizationId,
      headCount: {
        $gte: minHeadcount,
        $lte: maxHeadcount,
      },
    });
  }
}
