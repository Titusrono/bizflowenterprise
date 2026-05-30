import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Organization, OrganizationDocument } from '../schemas/organization.schema';
import { BaseRepository } from '../../common/repositories/base.repository';

/**
 * Organizations Repository
 * Extends BaseRepository with Organization-specific queries
 */
@Injectable()
export class OrganizationsRepository extends BaseRepository<OrganizationDocument> {
  constructor(
    @InjectModel(Organization.name)
    private readonly organizationModel: Model<OrganizationDocument>,
  ) {
    super(organizationModel);
  }

  /**
   * Find organization by code
   */
  async findByCode(code: string): Promise<OrganizationDocument | null> {
    return this.model
      .findOne({ code: code.toUpperCase(), isDeleted: false })
      .lean()
      .exec();
  }

  /**
   * Find organization by email
   */
  async findByEmail(email: string): Promise<OrganizationDocument | null> {
    return this.model
      .findOne({ email: email.toLowerCase(), isDeleted: false })
      .lean()
      .exec();
  }

  /**
   * Find organizations by owner
   */
  async findByOwner(ownerId: string, page: number = 1, limit: number = 10) {
    return this.findAllPaginated(
      { ownerId },
      page,
      limit,
    );
  }

  /**
   * Get organizations for a user (either owner or member)
   */
  async findForUser(userId: string) {
    return this.find({
      $or: [
        { ownerId: userId },
        { members: userId },
      ],
    });
  }

  /**
   * Count members in organization
   */
  async countMembers(organizationId: string): Promise<number> {
    const org = await this.model.findById(organizationId).lean().exec();
    return org?.members?.length || 0;
  }

  /**
   * Add member to organization
   */
  async addMember(organizationId: string, userId: string): Promise<OrganizationDocument | null> {
    return this.model
      .findByIdAndUpdate(
        organizationId,
        { $addToSet: { members: userId } },
        { new: true },
      )
      .lean()
      .exec();
  }

  /**
   * Remove member from organization
   */
  async removeMember(organizationId: string, userId: string): Promise<OrganizationDocument | null> {
    return this.model
      .findByIdAndUpdate(
        organizationId,
        { $pull: { members: userId } },
        { new: true },
      )
      .lean()
      .exec();
  }

  /**
   * Get active organizations
   */
  async findActive() {
    return this.find({
      status: 'active',
    });
  }

  /**
   * Get organization statistics
   */
  async getStats(organizationId: string) {
    const org = await this.model.findById(organizationId).lean().exec();
    if (!org) return null;

    return {
      id: org._id,
      name: org.name,
      memberCount: org.members?.length || 0,
      plan: org.plan,
      status: org.status,
      createdAt: org.createdAt,
    };
  }

  /**
   * Find organizations by plan
   */
  async findByPlan(plan: string) {
    return this.find({ plan });
  }

  /**
   * Find organizations with expiring plans
   */
  async findExpiringPlans(daysUntilExpiry: number = 7) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysUntilExpiry);

    return this.find({
      planEndDate: {
        $lte: futureDate,
        $gte: new Date(),
      },
    });
  }
}
