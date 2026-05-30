import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { BaseRepository } from '../../common/repositories/base.repository';
import { DocumentStatus } from '../../common/schemas/base.schema';

/**
 * Users Repository
 * Extends BaseRepository with User-specific queries
 * All basic CRUD operations are inherited from BaseRepository
 */
@Injectable()
export class UsersRepository extends BaseRepository<UserDocument> {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {
    super(userModel);
  }

  /**
   * Find user by email (custom query)
   */
  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.model
      .findOne({ email: email.toLowerCase(), isDeleted: false })
      .lean()
      .exec();
  }

  /**
   * Find users by organization
   */
  async findByOrganization(organizationId: string, page: number = 1, limit: number = 10) {
    return this.findAllPaginated(
      { organizationId },
      page,
      limit,
    );
  }

  /**
   * Find users by branch
   */
  async findByBranch(branchId: string, page: number = 1, limit: number = 10) {
    return this.findAllPaginated(
      { branchId },
      page,
      limit,
    );
  }

  /**
   * Find users by role
   */
  async findByRole(role: string, organizationId?: string) {
    const filter: any = { role };
    if (organizationId) {
      filter.organizationId = organizationId;
    }
    return this.find(filter);
  }

  /**
   * Find active users for organization
   */
  async findActiveByOrganization(organizationId: string) {
    return this.find({
      organizationId,
      status: 'active',
    });
  }

  /**
   * Get user statistics for organization
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
          _id: '$role',
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
   * Count active users in organization
   */
  async countActiveByOrganization(organizationId: string): Promise<number> {
    return this.model.countDocuments({
      organizationId: new Types.ObjectId(organizationId),
      status: DocumentStatus.ACTIVE,
      isDeleted: false,
    });
  }

  /**
   * Find users by multiple statuses
   */
  async findByStatuses(statuses: string[], organizationId: string) {
    return this.find({
      organizationId,
      status: { $in: statuses },
    });
  }
}
