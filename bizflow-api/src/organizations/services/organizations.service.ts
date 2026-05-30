import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { BaseService } from '../../common/services/base.service';
import { OrganizationDocument } from '../schemas/organization.schema';
import { OrganizationsRepository } from '../repositories/organizations.repository';
import { CreateOrganizationDto, UpdateOrganizationDto } from '../dto/organization.dto';

/**
 * Organizations Service
 * Extends BaseService with Organization-specific business logic
 * Handles organization management, member management, and planning
 */
@Injectable()
export class OrganizationsService extends BaseService<OrganizationDocument> {
  constructor(
    private readonly organizationsRepository: OrganizationsRepository,
  ) {
    super(organizationsRepository);
  }

  /**
   * Create organization
   */
  async createOrganization(
    createDto: CreateOrganizationDto,
    ownerId: string,
  ): Promise<OrganizationDocument> {
    // Check if code already exists
    const existingCode = await this.organizationsRepository.findByCode(
      createDto.code,
    );
    if (existingCode) {
      throw new ConflictException('Organization code already exists');
    }

    // Check if email already exists
    const existingEmail = await this.organizationsRepository.findByEmail(
      createDto.email,
    );
    if (existingEmail) {
      throw new ConflictException('Email already registered');
    }

    const organizationData = {
      ...createDto,
      ownerId: new Types.ObjectId(ownerId),
      code: createDto.code.toUpperCase(),
      email: createDto.email.toLowerCase(),
      members: [new Types.ObjectId(ownerId)],
      planStartDate: new Date(),
    };

    return this.repository.create(organizationData, ownerId);
  }

  /**
   * Get organization by code
   */
  async getByCode(code: string): Promise<OrganizationDocument> {
    const org = await this.organizationsRepository.findByCode(code);
    if (!org) {
      throw new BadRequestException('Organization not found');
    }
    return org;
  }

  /**
   * Get organizations for owner
   */
  async getByOwner(ownerId: string, page: number = 1, limit: number = 10) {
    return this.organizationsRepository.findByOwner(ownerId, page, limit);
  }

  /**
   * Get organizations for user (as owner or member)
   */
  async getForUser(userId: string) {
    return this.organizationsRepository.findForUser(userId);
  }

  /**
   * Add member to organization
   */
  async addMember(organizationId: string, userId: string): Promise<any> {
    const org = await this.repository.findById(organizationId);
    if (!org) {
      throw new BadRequestException('Organization not found');
    }

    const userObjectId = new Types.ObjectId(userId);
    if (org.members.some((id) => id.toString() === userObjectId.toString())) {
      throw new ConflictException('User is already a member');
    }

    return this.organizationsRepository.addMember(organizationId, userId);
  }

  /**
   * Remove member from organization
   */
  async removeMember(organizationId: string, userId: string): Promise<any> {
    const org = await this.repository.findById(organizationId);
    if (!org) {
      throw new BadRequestException('Organization not found');
    }

    const userObjectId = new Types.ObjectId(userId);
    if (!org.members.some((id) => id.toString() === userObjectId.toString())) {
      throw new BadRequestException('User is not a member');
    }

    // Prevent removing the owner
    if (org.ownerId.toString() === userObjectId.toString()) {
      throw new BadRequestException(
        'Cannot remove organization owner from members',
      );
    }

    return this.organizationsRepository.removeMember(organizationId, userId);
  }

  /**
   * Get organization statistics
   */
  async getStats(organizationId: string) {
    return this.organizationsRepository.getStats(organizationId);
  }

  /**
   * Update organization
   */
  async updateOrganization(
    organizationId: string,
    updateDto: UpdateOrganizationDto,
    currentUserId: string,
  ): Promise<any> {
    // Check if trying to change code
    if (updateDto.code) {
      const existingCode = await this.organizationsRepository.findByCode(
        updateDto.code,
      );
      if (existingCode && existingCode._id.toString() !== organizationId) {
        throw new ConflictException('Organization code already exists');
      }
    }

    // Check if trying to change email
    if (updateDto.email) {
      const existingEmail = await this.organizationsRepository.findByEmail(
        updateDto.email,
      );
      if (existingEmail && existingEmail._id.toString() !== organizationId) {
        throw new ConflictException('Email already in use');
      }
    }

    return this.repository.updateById(organizationId, updateDto, currentUserId);
  }

  /**
   * Soft delete organization
   */
  async softDelete(organizationId: string, currentUserId?: string): Promise<any> {
    return this.delete(organizationId, currentUserId);
  }

  /**
   * Get members count
   */
  async getMembersCount(organizationId: string): Promise<number> {
    return this.organizationsRepository.countMembers(organizationId);
  }

  /**
   * Get active organizations
   */
  async getActive() {
    return this.organizationsRepository.findActive();
  }

  /**
   * Get organizations by plan
   */
  async getByPlan(plan: string) {
    return this.organizationsRepository.findByPlan(plan);
  }

  /**
   * Check plan limits
   */
  async checkPlanLimits(organizationId: string): Promise<any> {
    const org = await this.repository.findById(organizationId);
    if (!org) {
      throw new BadRequestException('Organization not found');
    }

    return {
      plan: org.plan,
      membersCount: org.members?.length || 0,
      maxUsers: org.maxUsers,
      branchesCount: 0, // This would be fetched from branches collection
      maxBranches: org.maxBranches,
      canAddUsers: (org.members?.length || 0) < (org.maxUsers || 10),
      canAddBranches: 0 < (org.maxBranches || 1), // Placeholder
    };
  }

  /**
   * Find organizations with expiring plans
   */
  async getExpiringPlans(daysUntilExpiry: number = 7) {
    return this.organizationsRepository.findExpiringPlans(daysUntilExpiry);
  }
}
